import pytest
from fastapi.testclient import TestClient
from decimal import Decimal
from app.main import app
from app.api.v1.endpoints.payments import quote_engine
from app.services.providers import FxRateResult, FxUnavailableError
from app.core.config import settings

client = TestClient(app)

class FakeFxProvider:
    def __init__(self, fail=False, status="LIVE"):
        self.fail = fail
        self.status = status

    async def get_rate(self, src: str, dst: str, clock_time=None):
        if self.fail:
            raise FxUnavailableError("FX rate unavailable")
        
        # Fake rates
        rate = Decimal("1.0")
        if src == "INR" and dst == "USD": rate = Decimal("0.012")
        elif src == "USD" and dst == "INR": rate = Decimal("83.33333333")
        elif src == "EUR" and dst == "USD": rate = Decimal("1.1")
        elif src == "USD" and dst == "EUR": rate = Decimal("0.90909091")
        
        return FxRateResult(rate, self.status, "2026-09-19T10:00:00Z" if self.status != "SIMULATED" else None)

@pytest.fixture
def fake_fx():
    old_fx = quote_engine.fx
    fake = FakeFxProvider()
    quote_engine.fx = fake
    yield fake
    quote_engine.fx = old_fx

def get_base_payload():
    return {
        "source_currency": "INR",
        "destination_currency": "USD",
        "amount": "100000.00",
        "recipient": { "type": "WALLET_ADDRESS", "identifier": "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" },
        "source_country": "IN",
        "destination_country": "US"
    }

def test_tier1_pricing(fake_fx, monkeypatch):
    # Tier 1: Under $50
    monkeypatch.setattr(settings, "FX_MARGIN_BPS", 0)
    monkeypatch.setattr(settings, "NETWORK_FEE_USD", Decimal("0.001"))
    monkeypatch.setattr(settings, "TIER1_MAX_USD", Decimal("50.00"))
    monkeypatch.setattr(settings, "SETTLEMENT_SECONDS_ESTIMATE", 5)
    
    payload = get_base_payload()
    payload["amount"] = "3000.00" # 3000 INR = ~$36 USD < $50
    response = client.post("/api/v1/payments/quote", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["network_fee"] == "0.00"
    assert data["platform_fee"] == "0.00"
    assert data["fx_rate"] == "0.01200000"
    assert data["total_cost"] == "0.00"
    assert data["legacy_comparison"]["legacy_flat_fee"] == "708.33"

def test_tier2_pricing(fake_fx, monkeypatch):
    # Tier 2: $50 or over
    monkeypatch.setattr(settings, "FX_MARGIN_BPS", 0)
    monkeypatch.setattr(settings, "NETWORK_FEE_USD", Decimal("0.001"))
    monkeypatch.setattr(settings, "TIER2_FEE_BPS", 20) # 0.2%
    monkeypatch.setattr(settings, "TIER1_MAX_USD", Decimal("50.00"))
    monkeypatch.setattr(settings, "SETTLEMENT_SECONDS_ESTIMATE", 5)
    
    payload = get_base_payload()
    payload["amount"] = "100000.00" # 100k INR = ~$1200 USD >= $50
    response = client.post("/api/v1/payments/quote", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["platform_fee"] == "200.00"
    assert data["network_fee"] == "0.00"
    assert data["total_cost"] == "200.00"
    assert data["legacy_comparison"]["legacy_flat_fee"] == "708.33"

def test_invalid_currency(fake_fx):
    payload = get_base_payload()
    payload["source_currency"] = "US"
    payload["destination_currency"] = "XYZ"
    
    response = client.post("/api/v1/payments/quote", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert data["error"]["code"] == "VALIDATION_ERROR"
    details = data["error"]["details"]
    assert any(d["field"] == "source_currency" and d["code"] == "INVALID_CURRENCY" for d in details)
    assert any(d["field"] == "destination_currency" and d["code"] == "UNSUPPORTED_CURRENCY" for d in details)

def test_invalid_amount(fake_fx, monkeypatch):
    monkeypatch.setattr(settings, "QUOTE_MAX_AMOUNT", Decimal("1000.00"))
    invalid_amounts = [
        ("0", "INVALID_AMOUNT"),
        ("-5", "INVALID_AMOUNT"),
        ("abc", "INVALID_AMOUNT"),
        ("1e3", "INVALID_AMOUNT"),
        ("10.999", "AMOUNT_TOO_MANY_DECIMALS"),
        ("10000000", "AMOUNT_ABOVE_MAXIMUM")
    ]
    for amt, expected_code in invalid_amounts:
        payload = get_base_payload()
        payload["amount"] = amt
        response = client.post("/api/v1/payments/quote", json=payload)
        assert response.status_code == 400
        assert any(d["code"] == expected_code for d in response.json()["error"]["details"])

def test_amount_too_small(fake_fx, monkeypatch):
    # To test amount too small, we force a scenario where the fees > amount
    monkeypatch.setattr(settings, "TIER2_FEE_BPS", 15000) # 150% fee
    monkeypatch.setattr(settings, "TIER1_MAX_USD", Decimal("0.00")) # force tier 2
    payload = get_base_payload()
    payload["amount"] = "10.00"
    response = client.post("/api/v1/payments/quote", json=payload)
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "AMOUNT_TOO_SMALL_FOR_FEES"

def test_quote_consistency_invariant(fake_fx):
    amounts = ["10.00", "50.00", "100.50", "1000.00", "5000.25", "10000.00", "50000.00", "99999.99", "500000.00", "1000000.00"]
    for amt in amounts:
        payload = get_base_payload()
        payload["amount"] = amt
        response = client.post("/api/v1/payments/quote", json=payload)
        assert response.status_code == 200

def test_fx_unavailable(fake_fx):
    fake_fx.fail = True
    response = client.post("/api/v1/payments/quote", json=get_base_payload())
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "FX_UNAVAILABLE"

def test_data_quality(fake_fx):
    fake_fx.status = "CACHED"
    response = client.post("/api/v1/payments/quote", json=get_base_payload())
    assert response.status_code == 200
    assert response.json()["data_quality"]["fx_rate"]["status"] == "CACHED"

def test_same_country(fake_fx):
    payload = get_base_payload()
    payload["source_country"] = "US"
    payload["destination_country"] = "US"
    response = client.post("/api/v1/payments/quote", json=payload)
    assert response.status_code == 400
    assert any(d["code"] == "SAME_COUNTRY" for d in response.json()["error"]["details"])

def test_invalid_recipient(fake_fx):
    payload = get_base_payload()
    payload["recipient"]["identifier"] = "invalid_stellar_address"
    response = client.post("/api/v1/payments/quote", json=payload)
    assert response.status_code == 400
    assert any(d["code"] == "INVALID_RECIPIENT" for d in response.json()["error"]["details"])

def test_malformed_json():
    response = client.post("/api/v1/payments/quote", content="not json", headers={"Content-Type": "application/json"})
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "INVALID_REQUEST_BODY"

def test_unknown_field(fake_fx):
    payload = get_base_payload()
    payload["unknown_field"] = "value"
    response = client.post("/api/v1/payments/quote", json=payload)
    assert response.status_code == 400
    assert any(d["code"] == "UNKNOWN_FIELD" for d in response.json()["error"]["details"])

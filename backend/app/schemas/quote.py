import re
from pydantic import BaseModel, model_validator, Field, ConfigDict
from decimal import Decimal
from typing import Any, Optional, Dict, Literal
from app.core.config import settings

# ISO 3166-1 alpha-2 country codes
VALID_COUNTRIES = {
    "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT", "AU", "AW", "AX", "AZ",
    "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS",
    "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN",
    "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE",
    "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF",
    "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM",
    "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM",
    "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC",
    "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK",
    "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA",
    "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG",
    "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW",
    "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS",
    "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO",
    "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI",
    "VN", "VU", "WF", "WS", "YE", "YT", "ZA", "ZM", "ZW"
}

CURRENCY_DECIMALS = {
    "JPY": 0,
    "INR": 2, "USD": 2, "EUR": 2, "GBP": 2, "SGD": 2, "AED": 2, "AUD": 2, "CAD": 2
}

AMOUNT_REGEX = re.compile(r'^\d+(\.\d+)?$')
STELLAR_REGEX = re.compile(r'^G[A-Z2-7]{55}$')
UPI_REGEX = re.compile(r'^[A-Za-z0-9.\-_]{2,256}@[A-Za-z]{2,64}$')
EMAIL_REGEX = re.compile(r'^[^@]+@[^@]+\.[^@]+$')

class Recipient(BaseModel):
    model_config = ConfigDict(extra="forbid")
    type: str
    identifier: str

class QuoteRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    source_currency: str
    destination_currency: str
    amount: Any
    recipient: Recipient
    source_country: str
    destination_country: str

    @model_validator(mode='before')
    @classmethod
    def run_validations(cls, data: Any):
        if not isinstance(data, dict):
            return data
            
        errors = []

        def add_error(field: str, code: str, message: str):
            errors.append({"field": field, "code": code, "message": message})

        # Process currencies
        src_curr = data.get("source_currency")
        dst_curr = data.get("destination_currency")
        
        for field, curr in [("source_currency", src_curr), ("destination_currency", dst_curr)]:
            if curr is not None:
                if not isinstance(curr, str):
                    add_error(field, "INVALID_TYPE", "Currency must be a string")
                    continue
                curr = curr.upper()
                data[field] = curr
                if len(curr) != 3:
                    add_error(field, "INVALID_CURRENCY", f"Currency {field} must be 3 letters")
                elif curr not in settings.SUPPORTED_CURRENCIES:
                    add_error(field, "UNSUPPORTED_CURRENCY", f"Currency {curr} is not supported")

        # Process countries
        src_country = data.get("source_country")
        dst_country = data.get("destination_country")

        for field, ctry in [("source_country", src_country), ("destination_country", dst_country)]:
            if ctry is not None:
                if not isinstance(ctry, str):
                    add_error(field, "INVALID_TYPE", "Country must be a string")
                    continue
                ctry = ctry.upper()
                data[field] = ctry
                if ctry not in VALID_COUNTRIES:
                    add_error(field, "INVALID_COUNTRY", f"Invalid ISO 3166-1 alpha-2 country code: {ctry}")

        if (src_country and dst_country and isinstance(src_country, str) and isinstance(dst_country, str) 
                and src_country.upper() == dst_country.upper() and src_country.upper() in VALID_COUNTRIES):
            add_error("destination_country", "SAME_COUNTRY", "Source and destination countries cannot be the same")

        # Process recipient
        recip = data.get("recipient")
        if recip is not None:
            if not isinstance(recip, dict):
                add_error("recipient", "INVALID_TYPE", "Recipient must be an object")
            else:
                rtype = recip.get("type")
                ident = recip.get("identifier")
                if not isinstance(rtype, str) or not isinstance(ident, str):
                    if not isinstance(rtype, str):
                        add_error("recipient.type", "INVALID_TYPE", "Recipient type must be string")
                    if not isinstance(ident, str):
                        add_error("recipient.identifier", "INVALID_TYPE", "Recipient identifier must be string")
                else:
                    is_valid = False
                    if rtype == "WALLET_ADDRESS":
                        is_valid = bool(STELLAR_REGEX.match(ident))
                    elif rtype == "UPI_ID":
                        is_valid = bool(UPI_REGEX.match(ident))
                    elif rtype == "EMAIL":
                        is_valid = bool(EMAIL_REGEX.match(ident))
                    
                    if not is_valid:
                        add_error("recipient", "INVALID_RECIPIENT", f"Invalid identifier format for type {rtype}")

        # Process amount
        amount = data.get("amount")
        if amount is not None:
            if isinstance(amount, (bool, list, dict)) or amount is None:
                add_error("amount", "INVALID_AMOUNT", "Amount must be a decimal string or finite number")
            else:
                amount_str = str(amount)
                if not AMOUNT_REGEX.match(amount_str):
                    add_error("amount", "INVALID_AMOUNT", "Amount must be a positive decimal matching ^\d+(\.\d+)?$")
                else:
                    try:
                        d_amount = Decimal(amount_str)
                        if d_amount <= 0:
                            add_error("amount", "INVALID_AMOUNT", "Amount must be greater than zero")
                        elif d_amount < settings.QUOTE_MIN_AMOUNT:
                            add_error("amount", "AMOUNT_BELOW_MINIMUM", f"Amount below minimum {settings.QUOTE_MIN_AMOUNT}")
                        elif d_amount > settings.QUOTE_MAX_AMOUNT:
                            add_error("amount", "AMOUNT_ABOVE_MAXIMUM", f"Amount above maximum {settings.QUOTE_MAX_AMOUNT}")
                        else:
                            # Check decimals based on source_currency
                            if src_curr and isinstance(src_curr, str):
                                s_curr = src_curr.upper()
                                if s_curr in CURRENCY_DECIMALS:
                                    max_decimals = CURRENCY_DECIMALS[s_curr]
                                    if '.' in amount_str:
                                        decimals = len(amount_str.split('.')[1])
                                        if decimals > max_decimals:
                                            add_error("amount", "AMOUNT_TOO_MANY_DECIMALS", f"Too many decimal places for {s_curr}")
                    except Exception:
                        add_error("amount", "INVALID_AMOUNT", "Invalid decimal amount")
                data["amount"] = str(amount) # convert back to str so Pydantic parses it happily

        if errors:
            # We raise ValueError but it will be caught by FastAPI/Pydantic
            # We inject our specific structure by attaching it to the exception
            exc = ValueError("Validation failed")
            exc.custom_errors = errors
            raise exc

        return data

class DataQuality(BaseModel):
    status: Literal["LIVE", "CACHED", "SIMULATED"]
    source: str
    as_of: Optional[str]

class QuoteDataQuality(BaseModel):
    fx_rate: DataQuality
    network_fee: DataQuality
    settlement_time: DataQuality

class LegacyComparison(BaseModel):
    legacy_flat_fee: str
    legacy_fx_cost: str
    legacy_total_cost: str
    legacy_destination_amount: str
    savings_vs_legacy: str

class QuoteResponse(BaseModel):
    source_amount: str
    source_currency: str
    destination_amount: str
    destination_currency: str
    mid_market_rate: str
    fx_rate: str
    fx_margin_bps: int
    fx_cost: str
    network_fee: str
    platform_fee: str
    total_cost: str
    total_cost_percent: str
    cost_currency: str
    estimated_settlement_seconds: int
    route: Literal["BLOCKCHAIN"]
    is_simulated: bool
    data_quality: QuoteDataQuality
    legacy_comparison: LegacyComparison
    generated_at: str
    disclaimer: str = "Estimate only. Not a guaranteed rate or price."

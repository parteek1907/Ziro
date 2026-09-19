"""Multilingual AI Inclusion Assistant Router."""
import os
import httpx
from fastapi import APIRouter
from app.schemas import MentorMessageRequest, MentorMessageResponse

router = APIRouter(prefix="/api/mentor", tags=["AI Inclusion Mentor"])

# Rule-based fallback knowledge base for zero-dependency instant local execution
TOPIC_EXPLANATIONS = {
    "apr": {
        "reply": (
            "APR stands for Annual Percentage Rate. It is the cost of borrowing money for a year. "
            "Predatory lenders charge over 100% APR, meaning you pay back double what you borrowed. "
            "With Future Finance, unbanked micro-loans start at just 4.5% APR."
        ),
        "analogy": "Think of it like renting a tractor: a normal rental costs 50 cents a day, but an illegal loan shark charges $15 a day for the same tractor.",
        "tip": "Always check if your lender requires hidden processing fees before signing.",
    },
    "remittance": {
        "reply": (
            "Remittance is sending money across borders back home to your family. "
            "Traditional companies take up to $14 in fees for every $100 sent and make your family wait 3 days. "
            "Our L2 blockchain router sends the money in 2 seconds for less than 1 cent."
        ),
        "analogy": "It's like passing a digital note straight from your hand to your mother's hand across the ocean, without having to pay a middleman toll at every gate.",
        "tip": "Save your receipts offline in the vault so you have proof of payment even without cellular reception.",
    },
    "credit": {
        "reply": (
            "Your TrustScore proves that you pay your debts on time and that your community trusts you, "
            "even if you have never had a credit card or bank account before."
        ),
        "analogy": "Just like a neighborhood elder vouches that you are an honest shopkeeper, your digital TrustScore vouches for you to fair lenders worldwide.",
        "tip": "Top up your mobile airtime on regular weekly cycles to quickly boost your utility consistency score.",
    },
    "offline": {
        "reply": (
            "The Offline Vault allows you to sign money transfers on your phone when there is zero network. "
            "Your phone creates an encrypted QR code or SMS that completes the transfer as soon as any device touches signal."
        ),
        "analogy": "Writing a signed cheque in the field that can be carried to town and cashed securely.",
        "tip": "Keep your device code safe, as your offline cryptographic keys are stored only on your phone.",
    }
}


@router.post("/chat", response_model=MentorMessageResponse)
async def chat_with_inclusion_mentor(req: MentorMessageRequest):
    """
    Multilingual financial mentor that translates high-finance concepts into accessible everyday terms.
    If GEMINI_API_KEY is configured, it uses Gemini 1.5 Flash; otherwise it uses the built-in
    accessible knowledge base.
    """
    import google.generativeai as genai
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    query_lower = req.message.lower()

    # Optional Gemini LLM integration if key is present
    if gemini_api_key:
        try:
            genai.configure(api_key=gemini_api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = (
                "You are a compassionate, ultra-clear financial inclusion mentor for unbanked borrowers. "
                "Explain the concept in simple words. Avoid technical financial jargon. "
                f"Language: {req.language}. "
                f"User message: {req.message}"
            )
            response = model.generate_content(prompt)
            if response.text:
                return MentorMessageResponse(
                    reply=response.text.strip(),
                    simplified_analogy="AI-generated plain-language breakdown.",
                    actionable_tip="You can verify your credit qualification anytime on your dashboard.",
                    language=req.language,
                )
        except Exception:
            pass  # Fall back to localized knowledge base seamlessly

    # Fallback to local high-clarity knowledge base
    matched_key = "remittance"
    if "loan" in query_lower or "apr" in query_lower or "interest" in query_lower:
        matched_key = "apr"
    elif "score" in query_lower or "trust" in query_lower or "credit" in query_lower:
        matched_key = "credit"
    elif "offline" in query_lower or "internet" in query_lower or "signal" in query_lower or "qr" in query_lower:
        matched_key = "offline"

    entry = TOPIC_EXPLANATIONS[matched_key]

    return MentorMessageResponse(
        reply=entry["reply"],
        simplified_analogy=entry["analogy"],
        actionable_tip=entry["tip"],
        language=req.language,
    )

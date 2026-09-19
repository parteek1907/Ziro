import logging
from app.models.mentor import MentorChatRequest, MentorChatResponse
from app.services.ai_provider import ai_provider

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the Ziro AI Financial Mentor.
Your role is to act as a highly educational, personalized, and cautious financial advisor.
You have access to the user's financial profile, goals, and Ziro TrustScore.

STRICT CONSTRAINTS:
1. NEVER invent or hallucinate financial data, past payments, or blockchain states. If you do not have the information, say "I do not have access to that information."
2. NEVER attempt to execute payments, authorize transactions, or modify the user's security settings.
3. NEVER ask the user for their private keys, passwords, or seed phrases.
4. Keep your responses concise, explainable, and focused on financial literacy and security.
5. If the user asks you to perform an action (e.g., "send $50 to Alice"), you MUST refuse and instruct them to use the Ziro app interface instead.
"""

class MentorService:
    def chat(self, request: MentorChatRequest) -> MentorChatResponse:
        try:
            model = ai_provider.get_model(system_instruction=SYSTEM_PROMPT)
            
            # Construct context-aware prompt
            prompt = (
                f"Context:\n"
                f"- Financial Goals: {request.financial_goals}\n"
                f"- TrustScore: {request.trust_score if request.trust_score is not None else 'Unknown'}\n"
                f"- Profile Type: {request.profile_type}\n\n"
                f"User Message: {request.message}"
            )
            
            response = model.generate_content(prompt)
            
            # Simple safety fallback: if Gemini triggers a block or finishes early due to safety
            if response.prompt_feedback and response.prompt_feedback.block_reason:
                return MentorChatResponse(
                    reply="I'm sorry, but I cannot fulfill this request due to safety constraints.",
                    safety_flagged=True
                )
                
            reply_text = response.text
            
            # Additional heuristic guardrails
            lower_reply = reply_text.lower()
            if "private key" in lower_reply and "share" in lower_reply:
                return MentorChatResponse(
                    reply="Safety Error: Detected potential security violation in AI response.",
                    safety_flagged=True
                )
                
            return MentorChatResponse(reply=reply_text, safety_flagged=False)
            
        except ValueError as e:
            logger.error(f"AI Provider Error: {e}")
            return MentorChatResponse(
                reply="The AI Financial Mentor is currently offline or unconfigured. Please check API keys.",
                safety_flagged=True
            )
        except Exception as e:
            logger.error(f"Gemini API Error: {e}")
            return MentorChatResponse(
                reply="I'm currently unable to process your request due to a technical error.",
                safety_flagged=True
            )

mentor_service = MentorService()

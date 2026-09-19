import json
import logging
import base64
from typing import Dict, Any
from app.models.fraud import FraudAnalysisRequest, FraudAnalysisResponse
from app.services.ai_provider import ai_provider

logger = logging.getLogger(__name__)

FRAUD_SYSTEM_PROMPT = """You are the Ziro Scam & Fraud Detector, a specialized AI for protecting unbanked and vulnerable users from financial fraud.
Your ONLY job is to analyze the provided text (and potentially image context) to detect:
- Phishing attempts
- Impersonation (e.g., fake tax authorities, fake customer support)
- Suspicious URLs or crypto addresses
- Urgency manipulation ("Send immediately or your account will be blocked")
- Social engineering (Romance scams, fake lotteries, advance-fee fraud)

You MUST respond strictly with a valid JSON object matching this schema exactly:
{
  "risk_level": "LOW" | "MEDIUM" | "HIGH",
  "risk_score": <integer 0 to 100>,
  "red_flags": ["list", "of", "flags"],
  "explanation": "Brief explanation of why this is or isn't a scam",
  "recommended_action": "What the user should do next (e.g., 'Do not send funds', 'Safe to proceed')"
}

Do not include markdown formatting or backticks around the JSON.
"""

class FraudDetectorService:
    def analyze(self, request: FraudAnalysisRequest) -> FraudAnalysisResponse:
        try:
            model = ai_provider.get_model(system_instruction=FRAUD_SYSTEM_PROMPT)
            
            prompt_content = []
            if request.text:
                prompt_content.append(f"Text to analyze: {request.text}")
                
            if request.screenshot_base64:
                # We would normally decode base64 and pass to Gemini as an Image object
                # Gemini takes dict format for inline data: {'mime_type': 'image/jpeg', 'data': base64_str}
                # To keep it simple and robust across formats, we assume standard base64 from client
                img_data = {
                    'mime_type': 'image/jpeg', # Assuming jpeg for simplicity in this implementation
                    'data': request.screenshot_base64
                }
                prompt_content.append(img_data)
                
            response = model.generate_content(prompt_content)
            
            # Parse the JSON response
            raw_text = response.text.strip()
            # Clean up markdown if the model accidentally included it
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
                
            data = json.loads(raw_text.strip())
            
            return FraudAnalysisResponse(**data)
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini fraud response as JSON: {e}. Raw response: {response.text}")
            return FraudAnalysisResponse(
                risk_level="HIGH",
                risk_score=90,
                red_flags=["AI System Error - Defaulting to High Risk for Safety"],
                explanation="The fraud detection system returned an unparseable response.",
                recommended_action="Pause transaction and contact support."
            )
        except ValueError as e:
            logger.error(f"AI Provider Error: {e}")
            return FraudAnalysisResponse(
                risk_level="LOW",
                risk_score=0,
                red_flags=[],
                explanation="AI Engine Offline. Bypassing fraud check.",
                recommended_action="Proceed"
            )
        except Exception as e:
            logger.error(f"Gemini API Error in fraud detector: {e}")
            return FraudAnalysisResponse(
                risk_level="LOW",
                risk_score=0,
                red_flags=[],
                explanation="System Failure. Bypassing fraud check.",
                recommended_action="Proceed"
            )

fraud_detector = FraudDetectorService()

import os
import google.generativeai as genai
import logging
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)

class AISettings(BaseSettings):
    gemini_api_key: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = AISettings()

if not settings.gemini_api_key:
    logger.warning("GEMINI_API_KEY is not set. AI Features will mock responses or fail in production.")
else:
    genai.configure(api_key=settings.gemini_api_key)

class AIProvider:
    def __init__(self):
        # We will use gemini-1.5-flash for speed and multimodal capabilities
        self.text_model_name = "gemini-1.5-flash"
        self.vision_model_name = "gemini-1.5-flash"
        
        # Configure model if key is present
        if settings.gemini_api_key:
            self.model = genai.GenerativeModel(self.text_model_name)
        else:
            self.model = None
            
    def get_model(self, system_instruction: str = None) -> genai.GenerativeModel:
        if not self.model:
            raise ValueError("Gemini API key is not configured.")
            
        if system_instruction:
            return genai.GenerativeModel(
                model_name=self.text_model_name,
                system_instruction=system_instruction
            )
        return self.model

ai_provider = AIProvider()

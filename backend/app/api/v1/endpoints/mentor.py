from fastapi import APIRouter
from app.models.mentor import MentorChatRequest, MentorChatResponse
from app.services.mentor import mentor_service

router = APIRouter()

@router.post("/chat", response_model=MentorChatResponse)
async def mentor_chat(request: MentorChatRequest):
    """
    AI Financial Mentor Chat.
    Provides personalized financial advice using Gemini, based on the user's profile and goals.
    Strictly sandboxed to prevent hallucinations and direct payment execution.
    """
    return mentor_service.chat(request)

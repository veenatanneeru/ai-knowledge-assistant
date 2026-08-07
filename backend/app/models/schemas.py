from pydantic import BaseModel
from typing import Optional

class QuestionRequest(BaseModel):
    question: str
    chat_history: Optional[list] = []

class AnswerResponse(BaseModel):
    answer: str
    sources_used: int
    context_preview: str

class UploadResponse(BaseModel):
    success: bool
    filename: str
    chunks_created: int
    message: str
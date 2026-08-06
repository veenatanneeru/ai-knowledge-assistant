from fastapi import APIRouter
from pydantic import BaseModel

from app.services.vector_store import search_documents
from app.services.llm import ask_llama

router = APIRouter()


class Question(BaseModel):
    question: str


@router.post("/ask")
async def ask(data: Question):
    results = search_documents(data.question)

    context = "\n\n".join(
        [doc["text"] for doc in results]
    )

    answer = ask_llama(context, data.question)

    return {
        "question": data.question,
        "answer": answer,
        "sources": len(results)
    }
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.models.schemas import QuestionRequest, AnswerResponse, UploadResponse
from app.rag.pipeline import ingest_file, ingest_url, answer_question
from app.services.vector_store import get_document_count, clear_collection

router = APIRouter()

class URLRequest(BaseModel):
    url: str

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "documents_indexed": get_document_count()
    }

@router.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    allowed = [".pdf", ".txt", ".docx"]
    ext = "." + file.filename.split(".")[-1].lower()
    
    if ext not in allowed:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, TXT, and DOCX files supported"
        )
    
    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    
    result = ingest_file(file_bytes, file.filename)
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error"))
    
    return UploadResponse(
        success=True,
        filename=file.filename,
        chunks_created=result["chunks_created"],
        message=f"Indexed {result['chunks_created']} chunks from '{file.filename}'"
    )

@router.post("/upload-url", response_model=UploadResponse)
async def upload_from_url(request: URLRequest):
    if not request.url.startswith("http"):
        raise HTTPException(status_code=400, detail="Invalid URL")
    
    result = ingest_url(request.url)
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error"))
    
    return UploadResponse(
        success=True,
        filename=result["filename"],
        chunks_created=result["chunks_created"],
        message=f"Indexed {result['chunks_created']} chunks from URL"
    )

@router.post("/ask", response_model=AnswerResponse)
async def ask_question(request: QuestionRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    
    if get_document_count() == 0:
        return AnswerResponse(
            answer="No documents uploaded yet. Please upload a file first.",
            sources_used=0,
            context_preview=""
        )
    
    result = answer_question(request.question, request.chat_history)
    return AnswerResponse(**result)

@router.delete("/reset")
async def reset_knowledge_base():
    clear_collection()
    return {"message": "Knowledge base cleared successfully"}
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.models.schemas import QuestionRequest, AnswerResponse, UploadResponse
from app.rag.pipeline import ingest_file, ingest_url, answer_question, summarize_document
from app.services.vector_store import get_document_count, clear_collection, get_collections, switch_collection
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import io

router = APIRouter()

class URLRequest(BaseModel):
    url: str

class CollectionRequest(BaseModel):
    name: str

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "documents_indexed": get_document_count(),
        "collections": get_collections()
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

@router.post("/summarize")
async def summarize(file: UploadFile = File(...)):
    """Auto-summarize an uploaded document"""
    allowed = [".pdf", ".txt", ".docx"]
    ext = "." + file.filename.split(".")[-1].lower()
    
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    
    file_bytes = await file.read()
    result = await summarize_document(file_bytes, file.filename)
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error"))
    
    return result

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

@router.post("/export-chat")
async def export_chat(messages: list):
    """Export chat history as PDF"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("AI Knowledge Assistant — Chat Export", styles["Title"]))
    story.append(Spacer(1, 20))

    for msg in messages:
        role = "You" if msg["role"] == "user" else "Assistant"
        style = styles["Normal"]
        story.append(Paragraph(f"<b>{role}:</b> {msg['content']}", style))
        story.append(Spacer(1, 10))

    doc.build(story)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=chat-export.pdf"}
    )

@router.post("/collection")
async def create_collection(request: CollectionRequest):
    """Switch to a named knowledge base"""
    switch_collection(request.name)
    return {"message": f"Switched to knowledge base: {request.name}"}

@router.delete("/reset")
async def reset_knowledge_base():
    clear_collection()
    return {"message": "Knowledge base cleared successfully"}
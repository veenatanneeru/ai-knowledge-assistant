from fastapi import APIRouter, UploadFile, File, HTTPException
from io import BytesIO
from pypdf import PdfReader

from app.services.text_splitter import split_text
from app.services.vector_store import add_documents

router = APIRouter()


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    
    # Guard: empty file
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    filename = file.filename.lower()

    # Extract text based on file type
    if filename.endswith(".pdf"):
        text, pages = extract_pdf(contents)

    elif filename.endswith(".txt"):
        text = contents.decode("utf-8", errors="ignore")
        pages = 1

    else:
        raise HTTPException(
            status_code=415,
            detail="Unsupported file type. Please upload a PDF or TXT file."
        )

    # Guard: no text extracted
    if not text.strip():
        raise HTTPException(
            status_code=422,
            detail="Could not extract any text from this file."
        )

    chunks = split_text(text)
    total_stored = add_documents(chunks)

    return {
        "filename": file.filename,
        "pages": pages,
        "characters": len(text),
        "chunks_added": len(chunks),
        "total_stored": total_stored,
        "status": "success"
    }


def extract_pdf(contents: bytes) -> tuple[str, int]:
    reader = PdfReader(BytesIO(contents))
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text
    return text, len(reader.pages)
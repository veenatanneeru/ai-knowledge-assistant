from app.services.embeddings import create_embeddings
from app.services.vector_store import add_documents, search_documents
from app.services.llm import generate_answer
from app.services.text_splitter import split_text
import pypdf
import io
import requests
from bs4 import BeautifulSoup
import docx

def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = pypdf.PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

def extract_text_from_txt(file_bytes: bytes) -> str:
    return file_bytes.decode("utf-8", errors="ignore")

def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = docx.Document(io.BytesIO(file_bytes))
    return "\n".join([para.text for para in doc.paragraphs])

def extract_text_from_url(url: str) -> str:
    response = requests.get(url, timeout=10)
    soup = BeautifulSoup(response.text, "html.parser")
    # Remove scripts and styles
    for tag in soup(["script", "style", "nav", "footer"]):
        tag.decompose()
    return soup.get_text(separator="\n", strip=True)

def ingest_file(file_bytes: bytes, filename: str) -> dict:
    """Support PDF, TXT, DOCX files"""
    
    if filename.endswith(".pdf"):
        full_text = extract_text_from_pdf(file_bytes)
    elif filename.endswith(".txt"):
        full_text = extract_text_from_txt(file_bytes)
    elif filename.endswith(".docx"):
        full_text = extract_text_from_docx(file_bytes)
    else:
        return {"success": False, "error": "Unsupported file type"}
    
    if not full_text.strip():
        return {"success": False, "error": "Could not extract text from file"}
    
    chunks = split_text(full_text, chunk_size=400, overlap=80)
    embeddings = create_embeddings(chunks)
    doc_id = filename.replace(" ", "_").replace(".", "_")
    count = add_documents(chunks, embeddings, doc_id)
    
    return {
        "success": True,
        "filename": filename,
        "chunks_created": count,
        "total_chars": len(full_text)
    }

def ingest_url(url: str) -> dict:
    """Ingest text from a URL"""
    try:
        full_text = extract_text_from_url(url)
        if not full_text.strip():
            return {"success": False, "error": "Could not extract text from URL"}
        
        chunks = split_text(full_text, chunk_size=400, overlap=80)
        embeddings = create_embeddings(chunks)
        doc_id = url.replace("https://", "").replace("http://", "").replace("/", "_")[:50]
        count = add_documents(chunks, embeddings, doc_id)
        
        return {
            "success": True,
            "filename": url,
            "chunks_created": count,
            "total_chars": len(full_text)
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

def answer_question(question: str, chat_history: list = None) -> dict:
    question_embedding = create_embeddings([question])[0]
    context_chunks = search_documents(question, question_embedding, top_k=4)
    answer = generate_answer(question, context_chunks, chat_history)
    
    return {
        "answer": answer,
        "sources_used": len(context_chunks),
        "context_preview": context_chunks[0][:200] + "..." if context_chunks else ""
    }
from app.services.embeddings import create_embeddings
from app.services.vector_store import add_documents, search_documents
from app.services.llm import generate_answer
from app.services.text_splitter import split_text
import pypdf
import io

def ingest_pdf(file_bytes: bytes, filename: str) -> dict:
    # 1. Extract text from PDF
    reader = pypdf.PdfReader(io.BytesIO(file_bytes))
    full_text = ""
    for page in reader.pages:
        full_text += page.extract_text() + "\n"
    
    if not full_text.strip():
        return {"success": False, "error": "Could not extract text from PDF"}
    
    # 2. Split into chunks
    chunks = split_text(full_text, chunk_size=400, overlap=80)
    
    # 3. Create embeddings
    embeddings = create_embeddings(chunks)
    
    # 4. Store in ChromaDB
    doc_id = filename.replace(" ", "_").replace(".pdf", "")
    count = add_documents(chunks, embeddings, doc_id)
    
    return {
        "success": True,
        "filename": filename,
        "chunks_created": count,
        "total_chars": len(full_text)
    }

def answer_question(question: str, chat_history: list = None) -> dict:
    # 1. Embed the question
    question_embedding = create_embeddings([question])[0]
    
    # 2. Find relevant chunks
    context_chunks = search_documents(question, question_embedding, top_k=4)
    
    # 3. Generate answer
    answer = generate_answer(question, context_chunks, chat_history)
    
    return {
        "answer": answer,
        "sources_used": len(context_chunks),
        "context_preview": context_chunks[0][:200] + "..." if context_chunks else ""
    }
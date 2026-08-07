import chromadb
import os

CHROMA_PATH = os.path.join(os.path.dirname(__file__), "../../../vector_store")
client = chromadb.PersistentClient(path=CHROMA_PATH)
collection = client.get_or_create_collection(
    name="knowledge_base",
    metadata={"hnsw:space": "cosine"}
)

def add_documents(chunks: list[str], embeddings: list[list[float]], doc_id: str):
    ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=ids,
        metadatas=[{"doc_id": doc_id, "chunk_index": i} for i in range(len(chunks))]
    )
    return len(chunks)

def search_documents(question: str, question_embedding: list[float], top_k: int = 3):
    results = collection.query(
        query_embeddings=[question_embedding],
        n_results=min(top_k, collection.count() or 1)
    )
    if not results["documents"] or not results["documents"][0]:
        return []
    return results["documents"][0]

def get_document_count():
    return collection.count()

def clear_collection():
    global collection
    client.delete_collection("knowledge_base")
    collection = client.get_or_create_collection(
        name="knowledge_base",
        metadata={"hnsw:space": "cosine"}
    )
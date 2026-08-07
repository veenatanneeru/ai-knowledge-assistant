import chromadb
import os

CHROMA_PATH = os.path.join(os.path.dirname(__file__), "../../../vector_store")
client = chromadb.PersistentClient(path=CHROMA_PATH)

# Current active collection name
current_collection_name = "default"

def get_collection():
    return client.get_or_create_collection(
        name=current_collection_name,
        metadata={"hnsw:space": "cosine"}
    )

def switch_collection(name: str):
    """Switch to a different knowledge base"""
    global current_collection_name
    current_collection_name = name.replace(" ", "_").lower()

def get_collections() -> list:
    """Get all available knowledge bases"""
    return [c.name for c in client.list_collections()]

def add_documents(chunks: list[str], embeddings: list[list[float]], doc_id: str):
    collection = get_collection()
    ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=ids,
        metadatas=[{"doc_id": doc_id, "chunk_index": i} for i in range(len(chunks))]
    )
    return len(chunks)

def search_documents(question: str, question_embedding: list[float], top_k: int = 3):
    collection = get_collection()
    count = collection.count()
    if count == 0:
        return []
    results = collection.query(
        query_embeddings=[question_embedding],
        n_results=min(top_k, count)
    )
    if not results["documents"] or not results["documents"][0]:
        return []
    return results["documents"][0]

def get_document_count():
    return get_collection().count()

def clear_collection():
    global current_collection_name
    client.delete_collection(current_collection_name)
    get_collection()
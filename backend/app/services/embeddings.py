import ollama

def create_embeddings(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    
    embeddings = []
    for text in texts:
        response = ollama.embeddings(
            model="nomic-embed-text",
            prompt=text
        )
        embeddings.append(response["embedding"])
    
    return embeddings
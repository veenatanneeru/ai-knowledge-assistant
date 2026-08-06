import numpy as np
from app.services.embeddings import create_embeddings

documents = []

def add_documents(chunks):
    embeddings = create_embeddings(chunks)

    for text, embedding in zip(chunks, embeddings):
        documents.append({
            "text": text,
            "embedding": embedding
        })

    return len(documents)


def search_documents(question, top_k=3):
    if len(documents) == 0:
        return []

    question_embedding = create_embeddings([question])[0]

    scores = []

    for doc in documents:
        embedding = np.array(doc["embedding"])

        score = np.dot(question_embedding, embedding) / (
            np.linalg.norm(question_embedding)
            * np.linalg.norm(embedding)
        )

        scores.append((score, doc))

    scores.sort(key=lambda x: x[0], reverse=True)

    return [doc for score, doc in scores[:top_k]]
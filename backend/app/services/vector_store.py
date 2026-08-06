import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

documents = []


def add_documents(chunks):
    embeddings = model.encode(chunks)

    for text, embedding in zip(chunks, embeddings):
        documents.append({
            "text": text,
            "embedding": embedding.tolist()
        })

    return len(documents)


def search_documents(question, top_k=3):
    if len(documents) == 0:
        return []

    question_embedding = model.encode(question)

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
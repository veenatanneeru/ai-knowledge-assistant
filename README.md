# AI Knowledge Assistant (RAG Chatbot)

An AI-powered Knowledge Assistant that allows users to upload PDF documents and ask questions about them using Retrieval-Augmented Generation (RAG).

## Features

- Upload PDF documents
- Extract text automatically
- Split documents into chunks
- Generate embeddings using Sentence Transformers
- Store vectors in memory
- Semantic similarity search
- Answer questions using Llama 3.2 via Ollama
- FastAPI REST API
- Swagger UI for testing

## Tech Stack

- Python
- FastAPI
- Sentence Transformers
- Ollama
- Llama 3.2
- NumPy
- PyPDF
- Uvicorn

## API Endpoints

### Upload PDF

POST /upload

### Ask Question

POST /ask

## Example Questions

- Who is Veena?
- What programming languages does Veena know?
- What projects has Veena worked on?

## Run Locally

```bash
pip install -r requirements.txt

uvicorn app.main:app --reload
```

Open:

```
http://127.0.0.1:8000/docs
```

## Author

Veena Tanneeru

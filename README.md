# AI Knowledge Assistant (RAG Chatbot)

An AI-powered Retrieval-Augmented Generation (RAG) chatbot that enables users to upload PDF documents and ask questions using natural language. The application processes documents, generates embeddings, retrieves relevant context using FAISS, and produces accurate answers using Llama 3.2 through Ollama.

---

## Features

- Upload PDF documents
- Automatic text extraction
- Document chunking
- Semantic search using FAISS
- Sentence Transformer embeddings
- RAG pipeline with LangChain
- Question answering using Llama 3.2
- FastAPI REST API
- Interactive Swagger UI

---

## Tech Stack

- Python
- FastAPI
- LangChain
- FAISS
- Sentence Transformers
- Ollama
- Llama 3.2
- NumPy
- PyPDF
- Uvicorn

---

## Project Structure

```text
backend/
│
├── app/
│   ├── api/
│   ├── services/
│   └── main.py
│
├── images/
├── requirements.txt
└── .gitignore
```

---

## API Endpoints

### Upload PDF

```
POST /upload
```

### Ask Question

```
POST /ask
```

---

## Installation

```bash
git clone https://github.com/veenatanneeru/ai-knowledge-assistant.git

cd ai-knowledge-assistant/backend

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Open:

```
http://127.0.0.1:8000/docs
```

---

## Screenshots

(Add your screenshots here.)

---

## Future Improvements

- Multi-document support
- Chat history
- Streaming responses
- Source citations
- Docker support
- Cloud deployment
- User authentication

---

## Author

**Veena Tanneeru**

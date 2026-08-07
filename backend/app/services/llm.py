import ollama

def generate_answer(question: str, context_chunks: list[str], chat_history: list = None) -> str:
    if not context_chunks:
        context = "No relevant documents found."
    else:
        context = "\n\n---\n\n".join(context_chunks)
    
    system_prompt = """You are a helpful AI assistant that answers questions based on the provided documents.

Rules:
- Answer ONLY based on the context provided below
- If the answer is not in the context, say "I couldn't find that in the uploaded documents"
- Be concise and accurate

Context from documents:
""" + context

    messages = [{"role": "system", "content": system_prompt}]
    
    if chat_history:
        for msg in chat_history[-6:]:
            messages.append(msg)
    
    messages.append({"role": "user", "content": question})
    
    response = ollama.chat(
        model="llama3.2",
        messages=messages
    )
    
    return response["message"]["content"]
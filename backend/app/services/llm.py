import ollama


def ask_llama(context, question):
    prompt = f"""
You are a helpful AI assistant.

Use ONLY the context below to answer.

Context:
{context}

Question:
{question}

Answer:
"""

    response = ollama.chat(
        model="llama3.2",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response["message"]["content"]
import sys
from pathlib import Path

from dotenv import load_dotenv

# =========================
# PATH
# =========================

BASE_DIR = Path(__file__).resolve().parent.parent

if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

# =========================
# IMPORTS
# =========================

load_dotenv()

from generator import client
from rag.retriever import retrieve_context


# =========================
# RAG QUESTION ANSWERING
# =========================

def answer_question(question):

    contexts = retrieve_context(
        question,
        top_k=1
    )

    context_text = "\n\n".join(
        contexts
    )

    prompt = f"""
Anda adalah admin Gymnasyum.

Gunakan HANYA informasi berikut.

Context:
{context_text}

Pertanyaan:
{question}

Aturan:
- Jawab hanya berdasarkan context.
- Jangan mengarang harga, jadwal, atau kebijakan.
- Jika informasinya tidak ada di context,
  katakan bahwa informasi belum tersedia.
- Jawab dalam Bahasa Indonesia.
"""

    try:

        response = client.models.generate_content(
            model="models/gemini-3.8-flash",
            contents=prompt
        )

        answer = (
            response.text or ""
        ).strip()

        if answer:

            return answer

    except Exception as e:

        print(
            f"[RAG] Gemini error: {e}"
        )

    # =========================
    # FALLBACK 1
    # Tampilkan hasil retrieval
    # =========================

    if contexts:

        return (
            "Berdasarkan informasi yang tersedia:\n\n"
            f"{contexts[0]}"
        )

    # =========================
    # FALLBACK 2
    # Jika retrieval kosong
    # =========================

    return (
        "Maaf, informasi tersebut belum tersedia. "
        "Silakan hubungi admin Gymnasyum."
    )

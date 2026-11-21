"""
Entry point untuk Hugging Face Spaces dengan SDK Gradio (gratis di CPU basic).

Space menjalankan `python app.py`. File ini menyiapkan data yang tidak ikut
diupload (stopwords NLTK dan index RAG), lalu menjalankan FastAPI dari main.py
di port 7860. Endpoint-nya sama dengan saat dijalankan lewat uvicorn secara lokal.
"""

import os
from pathlib import Path

import nltk
import uvicorn

# preprocessing.py membutuhkan stopwords saat main.py di-import
nltk.download("stopwords", quiet=True)

# Index FAQ dibangun sekali saat Space pertama kali jalan
if not (Path(__file__).resolve().parent / "rag" / "chroma_db").exists():

    from rag.build_index import build_index

    build_index()

from main import app  # noqa: E402  (setelah stopwords tersedia)


if __name__ == "__main__":

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", "7860"))
    )

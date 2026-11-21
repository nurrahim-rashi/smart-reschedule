import sys
from pathlib import Path

import chromadb

# Supaya bisa dijalankan sebagai "python rag/build_index.py" dari folder ai-service
sys.path.append(str(Path(__file__).resolve().parent.parent))

from rag.retriever import (
    CHROMA_PATH,
    COLLECTION_NAME,
    EMBEDDING_MODEL,
    get_embedding_model,
)


# =========================
# CONFIG
# =========================

BASE_DIR = Path(__file__).resolve().parent

FAQ_FILE = BASE_DIR / "knowledge_base" / "faq.txt"


# =========================
# LOAD FAQ
# =========================

def load_documents():

    text = FAQ_FILE.read_text(
        encoding="utf-8"
    )

    sections = []

    current_section = []

    for line in text.splitlines():

        line = line.strip()

        if not line:
            continue

        # Ketemu section baru
        if line.startswith("[") and line.endswith("]"):

            if current_section:

                sections.append(
                    "\n".join(current_section)
                )

                current_section = []

        current_section.append(line)

    # section terakhir
    if current_section:

        sections.append(
            "\n".join(current_section)
        )

    return sections


# =========================
# BUILD INDEX
# =========================

def build_index():

    documents = load_documents()

    print()
    print("DOCUMENT COUNT =", len(documents))

    for i, doc in enumerate(documents):

        print(f"\n=== DOC {i} ===")
        print(doc[:300])

    client = chromadb.PersistentClient(
        path=str(CHROMA_PATH)
    )

    try:

        client.delete_collection(
            COLLECTION_NAME
        )

        print("\nCollection lama dihapus.")

    except Exception:

        pass

    collection = client.create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )

    embeddings = get_embedding_model().encode(
        documents,
        convert_to_numpy=True
    )

    print()
    print("DOCUMENTS =", len(documents))
    print("EMBEDDINGS =", len(embeddings))

    embeddings = embeddings.tolist()

    collection.add(
        ids=[
            f"doc_{i}"
            for i in range(len(documents))
        ],
        documents=documents,
        embeddings=embeddings
    )

    print()
    print("✅ Index berhasil dibuat.")
    print(f"📄 Document count: {len(documents)}")
    print(f"🧠 Model: {EMBEDDING_MODEL}")
    print(f"📁 Database: {CHROMA_PATH}")


# =========================
# MAIN
# =========================

if __name__ == "__main__":

    build_index()

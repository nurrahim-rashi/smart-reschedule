from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer


# =========================
# CONFIG
# =========================

BASE_DIR = Path(__file__).resolve().parent

FAQ_FILE = BASE_DIR / "knowledge_base" / "faq.txt"

CHROMA_PATH = BASE_DIR / "chroma_db"

COLLECTION_NAME = "gymnasyum_faq"


# =========================
# LOAD MODEL
# =========================

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


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
        name=COLLECTION_NAME
    )

    embeddings = embedding_model.encode(
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
    print(f"📁 Database: {CHROMA_PATH}")


# =========================
# MAIN
# =========================

if __name__ == "__main__":

    build_index()

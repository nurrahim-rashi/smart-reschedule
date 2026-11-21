from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent

CHROMA_PATH = BASE_DIR / "chroma_db"

COLLECTION_NAME = "gymnasyum_faq"

# Model multilingual: FAQ dan pertanyaan customer berbahasa Indonesia
EMBEDDING_MODEL = "paraphrase-multilingual-MiniLM-L12-v2"

# Jarak cosine maksimal agar sebuah dokumen dianggap relevan.
# Di atas nilai ini pertanyaan dianggap di luar topik FAQ (lihat eval_rag.py).
MAX_DISTANCE = 0.8


# =========================
# LAZY LOADING
# =========================
# Model dan index baru dimuat saat /chat pertama kali dipanggil,
# supaya endpoint lain tetap jalan walaupun index belum dibuat.

_models = {}

_collection = None


def get_embedding_model(name=EMBEDDING_MODEL):

    if name not in _models:

        from sentence_transformers import SentenceTransformer

        _models[name] = SentenceTransformer(name)

    return _models[name]


def get_collection():

    global _collection

    if _collection is None:

        import chromadb

        client = chromadb.PersistentClient(
            path=str(CHROMA_PATH)
        )

        _collection = client.get_collection(
            COLLECTION_NAME
        )

    return _collection


# =========================
# RETRIEVE
# =========================

def retrieve_context(
    question,
    top_k=3,
    max_distance=MAX_DISTANCE
):
    """
    Ambil potongan FAQ yang paling relevan dengan pertanyaan.

    Returns:
        list[str]: dokumen yang jaraknya <= max_distance,
        kosong jika pertanyaan di luar topik FAQ
    """

    query_embedding = get_embedding_model().encode(
        question
    ).tolist()

    results = get_collection().query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    return [
        document
        for document, distance in zip(
            results["documents"][0],
            results["distances"][0]
        )
        if distance <= max_distance
    ]

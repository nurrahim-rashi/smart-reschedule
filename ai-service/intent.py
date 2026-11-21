"""
Klasifikasi intent gabungan: model BiLSTM + aturan kata kunci.

Model sering salah pada pesan yang sangat pendek atau mengandung typo,
misalnya "pidnahin ke 3 minggu lagi" terbaca sebagai confirmation karena
kata "pidnahin" tidak dikenal tokenizer. Kata kunci yang jelas (termasuk
typo yang mirip) dipakai untuk mengoreksi hasil model.
"""

import re
from difflib import SequenceMatcher

from predictor import predict_intent


RESCHEDULE_KEYWORDS = [
    "pindah", "pindahin", "pindahkan",
    "geser", "geserin",
    "undur", "mundur", "mundurin",
    "reschedule", "resched",
    # Ejaan Indonesia yang umum dipakai
    "reskedul", "reskejul",
    "ganti jadwal", "ubah jadwal", "tukar jadwal",
]

CANCEL_KEYWORDS = [
    "batal", "batalin", "batalkan", "cancel",
    "gak jadi", "ga jadi", "nggak jadi", "tidak jadi", "enggak jadi",
]

# Customer yang mengonfirmasi perpindahan ("Mantap kak, jadi pindah ke Senin ya. Saya ok.")
# juga menyebut kata "pindah", tapi intent-nya confirmation, bukan reschedule
CONFIRMATION_KEYWORDS = [
    "ok", "oke", "okay", "okey", "sip", "siap", "mantap", "setuju", "deal", "noted",
]

# Typo dianggap sama jika kemiripannya >= nilai ini.
# "pidnahin" vs "pindahin" = 0.88, sedangkan "pinjam" vs "pindah" = 0.67
FUZZY_CUTOFF = 0.85

# Kata pendek terlalu mudah mirip kata lain, jadi hanya dicocokkan persis
MIN_FUZZY_LENGTH = 5

# Confidence yang dilaporkan saat intent berasal dari kata kunci
KEYWORD_CONFIDENCE = 0.9


def _similar(word, keyword):

    if word == keyword:

        return True

    if len(word) < MIN_FUZZY_LENGTH or len(keyword) < MIN_FUZZY_LENGTH:

        return False

    return SequenceMatcher(None, word, keyword).ratio() >= FUZZY_CUTOFF


def has_keyword(text, keywords):

    text = text.lower()
    words = re.findall(r"[a-z]+", text)

    for keyword in keywords:

        # Frasa dua kata dicocokkan persis
        if " " in keyword:

            if keyword in text:

                return True

        elif any(_similar(word, keyword) for word in words):

            return True

    return False


def classify_intent(text):
    """
    Returns:
        tuple: (intent, confidence, source)
        source = "model" atau "keyword"
    """

    intent, confidence = predict_intent(text)

    wants_reschedule = has_keyword(text, RESCHEDULE_KEYWORDS)
    wants_cancel = has_keyword(text, CANCEL_KEYWORDS)

    # Model membaca konfirmasi dan pesannya memang berisi kata konfirmasi: percayai model
    if intent == "confirmation" and has_keyword(text, CONFIRMATION_KEYWORDS):

        return intent, confidence, "model"

    # Kata kunci hanya dipakai jika maksudnya tidak ambigu
    if wants_reschedule and not wants_cancel and intent != "reschedule":

        return "reschedule", KEYWORD_CONFIDENCE, "keyword"

    if wants_cancel and not wants_reschedule and intent != "cancel":

        return "cancel", KEYWORD_CONFIDENCE, "keyword"

    return intent, confidence, "model"


# =========================
# MULTI INTENT
# =========================

# Pesan dipecah per kalimat dan kata sambung, mis.
# "Yang Rabu batalin ya, terus yang Sabtu pindah ke Minggu"
CLAUSE_SPLIT = r"[.;!?\n]+|,?\s*\b(?:tapi|terus|trus|lalu|sekalian|dan juga)\b"

# Hanya permintaan yang butuh tindakan berbeda yang ditandai
ACTIONABLE_INTENTS = {"reschedule", "cancel", "schedule_inquiry"}

INQUIRY_KEYWORDS = [
    "jam berapa", "kapan", "tanya", "nanya", "cek jadwal", "info jadwal",
]

# Sebuah bagian kalimat baru dihitung sebagai permintaan terpisah jika ada
# kata kuncinya. Kalimat alasan seperti "lagi ada acara keluarga" sering
# terbaca cancel oleh model, padahal bukan permintaan.
INTENT_EVIDENCE = {
    "reschedule": RESCHEDULE_KEYWORDS,
    "cancel": CANCEL_KEYWORDS,
    "schedule_inquiry": INQUIRY_KEYWORDS,
}

CLAUSE_CONFIDENCE = 0.6

MIN_CLAUSE_WORDS = 3


def split_clauses(text):

    return [
        clause.strip(" ,")
        for clause in re.split(CLAUSE_SPLIT, text, flags=re.IGNORECASE)
        if clause and len(clause.split()) >= MIN_CLAUSE_WORDS
    ]


def detect_other_intents(text, primary_intent):
    """
    Cari permintaan lain di dalam pesan selain intent utamanya.

    Returns:
        list[str]: intent tambahan, kosong jika pesan hanya berisi satu permintaan
    """

    clauses = split_clauses(text)

    if len(clauses) < 2:

        return []

    others = []

    for clause in clauses:

        intent, confidence, _ = classify_intent(clause)

        if (
            intent in ACTIONABLE_INTENTS
            and intent != primary_intent
            and intent not in others
            and confidence >= CLAUSE_CONFIDENCE
            and has_keyword(clause, INTENT_EVIDENCE[intent])
        ):

            others.append(intent)

    return others

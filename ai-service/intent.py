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

    # Kata kunci hanya dipakai jika maksudnya tidak ambigu
    if wants_reschedule and not wants_cancel and intent != "reschedule":

        return "reschedule", KEYWORD_CONFIDENCE, "keyword"

    if wants_cancel and not wants_reschedule and intent != "cancel":

        return "cancel", KEYWORD_CONFIDENCE, "keyword"

    return intent, confidence, "model"

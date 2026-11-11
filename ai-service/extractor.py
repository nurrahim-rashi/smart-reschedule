import re


# =========================
# PATTERNS
# =========================

DAYS = [
    "senin",
    "selasa",
    "rabu",
    "kamis",
    "jumat",
    "sabtu",
    # "minggu depan/ini/lalu" artinya pekan, bukan hari Minggu
    r"minggu(?!\s+(?:depan|ini|lalu|kemarin))",
    "hari ini",
    "besok",
    "lusa"
]

PERIODS = [
    "pagi",
    "siang",
    "sore",
    "malam"
]

TIME_PATTERNS = [

    # 08:30
    r"\b\d{1,2}:\d{2}\b",

    # 08.30
    r"\b\d{1,2}\.\d{2}\b",

    # jam 8
    r"jam\s+\d{1,2}",

    # 8 pagi
    r"\b\d{1,2}\s*pagi\b",

    # 2 siang
    r"\b\d{1,2}\s*siang\b",

    # 4 sore
    r"\b\d{1,2}\s*sore\b",

    # 8 malam
    r"\b\d{1,2}\s*malam\b"
]

# Kata yang menandai jadwal tujuan, misalnya "pindah ke Sabtu"
TARGET_MARKER = r"\b(?:ke|pindah|geser|ganti|ubah|jadi|menjadi)\b"


# =========================
# HELPERS
# =========================

def split_target(text):
    """
    Pisahkan bagian pesan setelah kata penanda tujuan.

    "jadwal rabu aku pindah ke sabtu" -> " ke sabtu"
    Jika tidak ada penanda, kembalikan None.
    """

    match = re.search(TARGET_MARKER, text)

    if match:

        return text[match.end():]

    return None


def find_preferred(options, text, target):
    """
    Ambil opsi yang paling mungkin merupakan jadwal tujuan:
    1. yang pertama muncul setelah kata penanda tujuan
    2. jika tidak ada, yang terakhir disebut di pesan
    """

    pattern = r"\b(" + "|".join(options) + r")\b"

    if target is not None:

        match = re.search(pattern, target)

        if match:

            return match.group(1)

    matches = re.findall(pattern, text)

    if matches:

        return matches[-1]

    return None


def find_time(text, target):

    for region in (target, text):

        if region is None:

            continue

        for pattern in TIME_PATTERNS:

            match = re.search(
                pattern,
                region
            )

            if match:

                return match.group()

    return None


# =========================
# EXTRACT PREFERENCES
# =========================

def extract_preferences(text):

    text = text.lower()

    target = split_target(text)

    preferred_day = find_preferred(DAYS, text, target)
    preferred_period = find_preferred(PERIODS, text, target)
    preferred_time = find_time(text, target)

    return (
        preferred_day,
        preferred_period,
        preferred_time
    )

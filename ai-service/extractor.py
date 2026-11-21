import re


# =========================
# PATTERNS
# =========================

# Angka yang ditulis dengan kata, mis. "dua minggu lagi"
WORD_NUMBERS = {
    "se": 1,
    "satu": 1,
    "dua": 2,
    "tiga": 3,
    "empat": 4,
}

# "3 minggu lagi", "seminggu lagi", "5 hari lagi", "2 bulan lagi"
RELATIVE_PATTERN = r"(?:\d+\s*|se|satu\s+|dua\s+|tiga\s+|empat\s+)(?:hari|minggu|bulan)\s+lagi"

DAYS = [
    RELATIVE_PATTERN,
    # "minggu depannya lagi" = dua minggu lagi; pola yang lebih panjang harus di depan
    r"minggu\s+depan(?:nya)?\s+lagi",
    r"minggu\s+depan(?:nya)?",
    r"bulan\s+depan(?:nya)?",
    "senin",
    "selasa",
    "rabu",
    "kamis",
    "jumat",
    "sabtu",
    # "minggu depan/ini/lalu/lagi" artinya pekan, bukan hari Minggu
    r"minggu(?!\s+(?:depan|ini|lalu|kemarin|lagi))",
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


def normalize_day(day):
    """
    Seragamkan hari relatif supaya mudah dibaca backend.

    "seminggu lagi" -> "1 minggu lagi", "tiga  minggu lagi" -> "3 minggu lagi"
    """

    if day is None:

        return None

    match = re.fullmatch(r"(\d+|se|satu|dua|tiga|empat)\s*(hari|minggu|bulan)\s+lagi", day)

    if match:

        amount, unit = match.groups()
        number = int(amount) if amount.isdigit() else WORD_NUMBERS[amount]

        return f"{number} {unit} lagi"

    if re.fullmatch(r"minggu\s+depan(?:nya)?\s+lagi", day):

        return "2 minggu lagi"

    if re.fullmatch(r"minggu\s+depan(?:nya)?", day):

        return "minggu depan"

    if re.fullmatch(r"bulan\s+depan(?:nya)?", day):

        return "1 bulan lagi"

    return re.sub(r"\s+", " ", day)


# =========================
# EXTRACT PREFERENCES
# =========================

def extract_preferences(text):

    text = text.lower()

    target = split_target(text)

    preferred_day = normalize_day(find_preferred(DAYS, text, target))
    preferred_period = find_preferred(PERIODS, text, target)
    preferred_time = find_time(text, target)

    return (
        preferred_day,
        preferred_period,
        preferred_time
    )

import re


def extract_preferences(text):

    text = text.lower()

    preferred_day = None
    preferred_period = None
    preferred_time = None

    # =========================
    # DAY EXTRACTION
    # =========================

    days = [
        "senin",
        "selasa",
        "rabu",
        "kamis",
        "jumat",
        "sabtu",
        "minggu"
    ]

    relative_days = [
        "hari ini",
        "besok",
        "lusa"
    ]

    for day in days:

        if day in text:

            preferred_day = day
            break

    if preferred_day is None:

        for day in relative_days:

            if day in text:

                preferred_day = day
                break

    # =========================
    # PERIOD EXTRACTION
    # =========================

    periods = [
        "pagi",
        "siang",
        "sore",
        "malam"
    ]

    for period in periods:

        if period in text:

            preferred_period = period
            break

    # =========================
    # TIME EXTRACTION
    # =========================

    patterns = [

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

    for pattern in patterns:

        match = re.search(
            pattern,
            text
        )

        if match:

            preferred_time = match.group()
            break

    return (
        preferred_day,
        preferred_period,
        preferred_time
    )
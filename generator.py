import os

from dotenv import load_dotenv
from google import genai

# =========================
# LOAD ENVIRONMENT
# =========================

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


# =========================
# GENERATE REPLY
# =========================

def generate_reply(intent, slots):

    prompt = f"""
Anda adalah admin Gymnasyum.

Intent customer:
{intent}

Slot yang tersedia:
{', '.join(slots)}

Buat balasan WhatsApp yang:

- sopan
- profesional
- ramah
- singkat
- maksimal 100 kata

Gunakan Bahasa Indonesia.
"""

    try:

        response = client.models.generate_content(
            model="models/gemini-flash-lite-latest",
            contents=prompt
        )

        return response.text

    except Exception:

        slot_text = "\n".join(
            [f"- {slot}" for slot in slots]
        )

        return f"""
Halo Kak,

Permintaan {intent} telah kami terima.

Saat ini tersedia slot:

{slot_text}

Silakan pilih jadwal yang paling sesuai.

Terima kasih.
"""
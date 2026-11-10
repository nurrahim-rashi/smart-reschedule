from fastapi import FastAPI
from pydantic import BaseModel

from predictor import predict_intent
from generator import generate_reply
from extractor import extract_preferences


app = FastAPI(
    title="Smart Reschedule Assistant API",
    version="1.0.0",
    description="Intent Classification, Entity Extraction, and Response Generation API"
)


# =========================
# SCHEMAS
# =========================

class Message(BaseModel):
    message: str


class ReplyRequest(BaseModel):
    intent: str
    slots: list[str] = []
    message: str | None = None
    customer_name: str | None = None
    current_schedule: str | None = None
    preferred_day: str | None = None
    preferred_period: str | None = None
    preferred_time: str | None = None


# =========================
# HEALTH CHECK
# =========================

@app.get("/")
def home():

    return {
        "message": "AI Service Running"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# =========================
# MODEL INFORMATION
# =========================

@app.get("/model-info")
def model_info():

    return {
        "model": "BiLSTM",
        "classes": [
            "cancel",
            "confirmation",
            "other",
            "reschedule",
            "schedule_inquiry"
        ]
    }


# =========================
# INTENT CLASSIFICATION
# =========================

@app.post("/predict")
def predict(data: Message):

    intent, confidence = predict_intent(
        data.message
    )

    return {
        "intent": intent,
        "confidence": confidence
    }


# =========================
# GENERATIVE AI RESPONSE
# =========================

@app.post("/generate-reply")
def generate(request: ReplyRequest):

    preferences = {
        "hari": request.preferred_day,
        "waktu": request.preferred_period,
        "jam": request.preferred_time
    }

    # Ambil preferensi dari pesan jika backend tidak mengirimkannya
    if request.message and not any(preferences.values()):

        (
            preferences["hari"],
            preferences["waktu"],
            preferences["jam"]
        ) = extract_preferences(
            request.message
        )

    draft = generate_reply(
        request.intent,
        request.slots,
        request.message,
        request.customer_name,
        request.current_schedule,
        preferences
    )

    return {
        "draft_reply": draft
    }


# =========================
# COMPLETE ANALYSIS
# =========================

@app.post("/analyze-message")
def analyze_message(data: Message):

    intent, confidence = predict_intent(
        data.message
    )

    (
        preferred_day,
        preferred_period,
        preferred_time
    ) = extract_preferences(
        data.message
    )

    return {
        "message": data.message,
        "intent": intent,
        "confidence": confidence,
        "preferred_day": preferred_day,
        "preferred_period": preferred_period,
        "preferred_time": preferred_time
    }
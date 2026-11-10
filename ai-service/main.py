import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from predictor import predict_intent
from generator import generate_reply, fallback_reply
from extractor import extract_preferences


load_dotenv()

logging.basicConfig(
    level=logging.INFO
)


app = FastAPI(
    title="Smart Reschedule Assistant API",
    version="1.0.0",
    description="Intent Classification, Entity Extraction, and Response Generation API"
)


# =========================
# CORS
# =========================

CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in CORS_ORIGINS.split(",")
        if origin.strip()
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["*"]
)


# =========================
# CONFIG
# =========================

# Di bawah nilai ini intent dianggap tidak yakin dan draft perlu dicek admin
CONFIDENCE_THRESHOLD = 0.6


# =========================
# SCHEMAS
# =========================

class Message(BaseModel):
    message: str = Field(min_length=1, max_length=1000)


class ReplyRequest(BaseModel):
    intent: str = Field(max_length=50)
    slots: list[str] = Field(default=[], max_length=20)
    message: str | None = Field(default=None, max_length=1000)
    customer_name: str | None = Field(default=None, max_length=100)
    current_schedule: str | None = Field(default=None, max_length=100)
    preferred_day: str | None = None
    preferred_period: str | None = None
    preferred_time: str | None = None


class DraftRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    slots: list[str] = Field(default=[], max_length=20)
    customer_name: str | None = Field(default=None, max_length=100)
    current_schedule: str | None = Field(default=None, max_length=100)


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

    draft, source = generate_reply(
        request.intent,
        request.slots,
        request.message,
        request.customer_name,
        request.current_schedule,
        preferences
    )

    return {
        "draft_reply": draft,
        "source": source
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


# =========================
# FULL PIPELINE
# =========================

@app.post("/draft-reply")
def draft_reply(request: DraftRequest):

    intent, confidence = predict_intent(
        request.message
    )

    (
        preferred_day,
        preferred_period,
        preferred_time
    ) = extract_preferences(
        request.message
    )

    if confidence < CONFIDENCE_THRESHOLD:

        # Intent tidak yakin: jangan biarkan Gemini menebak, serahkan ke admin
        draft = fallback_reply(
            "other",
            request.slots,
            request.customer_name
        )
        source = "low_confidence"

    else:

        draft, source = generate_reply(
            intent,
            request.slots,
            request.message,
            request.customer_name,
            request.current_schedule,
            {
                "hari": preferred_day,
                "waktu": preferred_period,
                "jam": preferred_time
            }
        )

    return {
        "intent": intent,
        "confidence": confidence,
        "preferred_day": preferred_day,
        "preferred_period": preferred_period,
        "preferred_time": preferred_time,
        "draft_reply": draft,
        "source": source,
        "needs_review": source != "gemini"
    }

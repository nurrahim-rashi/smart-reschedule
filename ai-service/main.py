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
    slots: list[str]


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

    draft = generate_reply(
        request.intent,
        request.slots
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
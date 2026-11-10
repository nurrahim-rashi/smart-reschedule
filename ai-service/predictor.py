import numpy as np
import joblib

from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences

from preprocessing import clean_text


# =========================
# CONFIG
# =========================

MODEL_PATH = "models/intent_classifier.keras"
TOKENIZER_PATH = "models/tokenizer.pkl"
ENCODER_PATH = "models/label_encoder.pkl"

MAX_LEN = 50


# =========================
# LOAD MODEL
# =========================

model = load_model(MODEL_PATH)

tokenizer = joblib.load(TOKENIZER_PATH)

encoder = joblib.load(ENCODER_PATH)


# =========================
# PREDICT INTENT
# =========================

def predict_intent(text):
    """
    Predict customer intent.

    Parameters:
        text (str): customer message

    Returns:
        tuple:
        (intent, confidence)
    """

    try:

        cleaned_text = clean_text(text)

        sequence = tokenizer.texts_to_sequences(
            [cleaned_text]
        )

        padded = pad_sequences(
            sequence,
            maxlen=MAX_LEN,
            padding="post"
        )

        prediction = model.predict(
            padded,
            verbose=0
        )

        idx = np.argmax(prediction)

        intent = encoder.inverse_transform(
            [idx]
        )[0]

        confidence = float(
            np.max(prediction)
        )

        return intent, confidence

    except Exception as e:

        print(
            f"[ERROR] Prediction failed: {e}"
        )

        return "other", 0.0
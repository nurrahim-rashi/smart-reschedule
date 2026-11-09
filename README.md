# Smart Reschedule Assistant - AI Service

AI Service untuk Smart Reschedule Assistant Gymnasyum.

Service ini bertugas untuk:

- Intent Classification
- Entity Extraction
- Draft Response Generation
- Inference API menggunakan FastAPI
- Integrasi Gemini API

---

# Features

## Intent Classification

Mengklasifikasikan pesan customer menjadi:

- Reschedule
- Cancel
- Schedule Inquiry
- Confirmation
- Other

Contoh:

Input:

```text
Saya ingin pindah jadwal ke Sabtu pagi
```

Output:

```json
{
  "intent": "reschedule",
  "confidence": 0.99
}
```

---

## Entity Extraction

Mengekstrak informasi preferensi customer dari pesan.

Contoh:

Input:

```text
Besok saya tidak bisa hadir, pindah Jumat sore jam 16:00
```

Output:

```json
{
  "preferred_day": "jumat",
  "preferred_period": "sore",
  "preferred_time": "16:00"
}
```

---

## Draft Response Generation

Menggunakan Gemini untuk menghasilkan draft balasan otomatis.

Contoh:

Input:

```json
{
  "intent": "reschedule",
  "slots": [
    "Sabtu 08:00",
    "Sabtu 10:00"
  ]
}
```

Output:

```json
{
  "draft_reply": "Halo Kak, terima kasih atas permintaan reschedule..."
}
```

---

# Tech Stack

- Python
- FastAPI
- TensorFlow
- BiLSTM
- Scikit-learn
- NLTK
- Sastrawi
- Gemini API

---

# Project Structure

```text
ai-service/
│
├── main.py
├── predictor.py
├── preprocessing.py
├── extractor.py
├── generator.py
│
├── models/
│   ├── intent_classifier.keras
│   ├── tokenizer.pkl
│   └── label_encoder.pkl
│
├── .env
├── .gitignore
├── requirements.txt
└── README.md
```

---

# Installation

## Clone Repository

```bash
git clone <repository-url>
cd ai-service
```

## Create Virtual Environment

```bash
python -m venv venv
```

Activate:

Windows

```bash
venv\Scripts\activate
```

Linux / MacOS

```bash
source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Download NLTK Stopwords

```bash
python -m nltk.downloader stopwords
```

---

# Environment Variables

Buat file `.env`

```env
GEMINI_API_KEY=YOUR_API_KEY
```

---

# Run Application

```bash
uvicorn main:app --reload
```

API akan berjalan di:

```text
http://127.0.0.1:8000
```

Swagger Documentation:

```text
http://127.0.0.1:8000/docs
```

---

# API Endpoints

## Root Endpoint

### Request

```http
GET /
```

### Response

```json
{
  "message": "AI Service Running"
}
```

---

## Health Check

### Request

```http
GET /health
```

### Response

```json
{
  "status": "healthy"
}
```

---

## Model Information

### Request

```http
GET /model-info
```

### Response

```json
{
  "model": "BiLSTM",
  "classes": [
    "cancel",
    "confirmation",
    "other",
    "reschedule",
    "schedule_inquiry"
  ]
}
```

---

## Predict Intent

### Request

```http
POST /predict
```

Body:

```json
{
  "message": "Saya ingin pindah jadwal ke Sabtu pagi"
}
```

### Response

```json
{
  "intent": "reschedule",
  "confidence": 0.999
}
```

---

## Analyze Customer Message

### Request

```http
POST /analyze-message
```

Body:

```json
{
  "message": "Besok saya tidak bisa hadir, pindah Jumat sore jam 16:00"
}
```

### Response

```json
{
  "message": "Besok saya tidak bisa hadir, pindah Jumat sore jam 16:00",
  "intent": "reschedule",
  "confidence": 0.999,
  "preferred_day": "jumat",
  "preferred_period": "sore",
  "preferred_time": "16:00"
}
```

---

## Generate Draft Reply

### Request

```http
POST /generate-reply
```

Body:

```json
{
  "intent": "reschedule",
  "slots": [
    "Sabtu 08:00",
    "Sabtu 10:00"
  ]
}
```

### Response

```json
{
  "draft_reply": "Halo Kak, terima kasih atas permintaan reschedule..."
}
```

---

# Model Performance

Dataset:

```text
5000 messages
```

Classes:

```text
Reschedule
Cancel
Schedule Inquiry
Confirmation
Other
```

Models Evaluated:

- Logistic Regression
- Linear SVM
- BiLSTM

Final Model:

```text
BiLSTM
```

Metrics:

- Accuracy
- Precision
- Recall
- F1-Score
- Confusion Matrix

---

# Team Integration

Backend dapat memanggil endpoint berikut:

```http
POST /predict
POST /analyze-message
POST /generate-reply
```

Output endpoint dapat disimpan ke tabel:

```text
ai_analyses
reply_drafts
```

sesuai ERD Smart Reschedule Assistant.

---

# License

Capstone Project - Dicoding Generative AI Bootcamp

Gymnasyum Smart Reschedule Assistant

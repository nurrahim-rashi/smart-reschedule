# Smart Reschedule Assistant

An AI-powered assistant for understanding reschedule requests at **Gymnasyum**, a gym and private-coaching studio in Indonesia.
Capstone Project for Dicoding Bootcamp, team **DB15-G006**.

Customers ask to move their sessions in free-form, casual Indonesian, for example *“pindahin ke minggu depannya lagi dong”* (“move it to the week after next, please”). AI works out what they mean, the backend finds matching slots, and the admin approves or rejects the request with a reply drafted by generative AI. The final decision always stays with the admin.

## Features

**Member**

- Book sessions: hourly slots, every day from 07:00 to 21:00, up to 30 days ahead
- Reschedule with a free-form message: AI reads the intent and time preferences, then recommends slots and alternatives
- Cancel sessions
- History of requests and cancellations on the Request Status page

**Admin**

- Requests grouped by status: Pending, Approved, Rejected, Cancelled
- AI analysis: intent, confidence, preferences, and any other requests in the same message
- Editable AI reply drafts based on the decision (approve, or reject with alternative slots)

**AI**

- 5-class intent classification (BiLSTM + a typo-tolerant keyword layer)
- Extraction of day, time of day, and hour, including relative dates (“besok” / tomorrow, “3 minggu lagi” / in 3 weeks, “bulan depan” / next month)
- Reply drafts generated with Gemini and validated so they only mention slots that exist in the database
- FAQ answers with RAG (ChromaDB + multilingual embeddings)

## Architecture

```
frontend (React, :5173)
    │  REST + JWT                 │  message analysis
    ▼                             ▼
backend (Hapi, :5000) ───────► ai-service (FastAPI, :8000)
    │                              ├─ BiLSTM (intent)
    ▼                              ├─ Gemini (reply drafts)
PostgreSQL                         └─ ChromaDB (RAG FAQ)
```

| Folder                     | Contents                                         |
| -------------------------- | ------------------------------------------------ |
| [frontend/](frontend/)     | React + Vite, Tailwind CSS + daisyUI             |
| [backend/](backend/)       | Hapi (Node.js), PostgreSQL, node-pg-migrate, JWT |
| [ai-service/](ai-service/) | FastAPI, TensorFlow (BiLSTM), Gemini, ChromaDB   |
| [docs/](docs/)             | API, database, and AI documentation, user guides, and slides |

## Running locally

Requirements: Node.js 20+, Python 3.11+, PostgreSQL, and a Gemini API key ([Google AI Studio](https://aistudio.google.com/apikey)).

### 1. Database and backend

```bash
psql -U postgres -h localhost -c "CREATE DATABASE gymnasyum"
cd backend
cp .env.example .env
npm install
npm run migrate up
npm run start:dev
```

Set `PGPASSWORD` and `ACCESS_TOKEN_KEY` in `backend/.env` before starting. On startup, the backend automatically creates slots for the next `SLOT_DAYS_AHEAD` days.

> On macOS, port 5000 is used by AirPlay Receiver. Turn it off in System Settings › General › AirDrop & Handoff, or change `PORT`.

### 2. AI service

```bash
cd ai-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m nltk.downloader stopwords
cp .env.example .env
python rag/build_index.py
python -m uvicorn main:app --reload --port 8000
```

Set `GEMINI_API_KEY` in `ai-service/.env`. `build_index.py` downloads the embedding model (about 470 MB) the first time it runs. If Gemini calls take minutes on your network, set `FORCE_IPV4=1`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

### Accounts

There are no default accounts. Sign up on the Register page (accounts get the `customer` role). To create an admin:

```bash
psql -U postgres -h localhost -d gymnasyum -c "UPDATE users SET role='admin' WHERE email='admin@contoh.com'"
```

`backend/seed.sql` does the same for `admin@contoh.com` and adds a sample booking for `customer@contoh.com`. Run it after both accounts are registered and the backend has started at least once.

## Testing

```bash
cd backend && npm test
cd frontend && npm test
cd ai-service && python -m unittest test_intent.py test_extractor.py test_generator.py test_rag.py
```

AI evaluations (these need the trained model and, for drafts, a Gemini API key):

| Script                  | What it measures                                       | Latest result                          |
| ----------------------- | ------------------------------------------------------ | -------------------------------------- |
| `python eval_intent.py` | Intent accuracy on an independent test set (100 messages) | BiLSTM 95%, BiLSTM + keyword layer 96% |
| `python eval_drafts.py` | Quality of Gemini reply drafts (12 scenarios)          | 12/12 passed every check               |
| `python eval_rag.py`    | FAQ retrieval accuracy (20 questions)                  | Top-1 16/20, top-3 19/20               |

## Documentation

- [docs/User Guide - DB15-G006.pdf](<docs/User Guide - DB15-G006.pdf>): product user guide for members and admins, with screenshots
- [docs/PPT Smart Reschedule Assistant (English).pdf](<docs/PPT Smart Reschedule Assistant (English).pdf>): presentation slides
- [docs/DEPLOY.md](docs/DEPLOY.md): deployment to Hugging Face Spaces, Railway, and Vercel (Indonesian)
- [docs/API.md](docs/API.md): backend and AI service endpoints (Indonesian)
- [docs/DATABASE.md](docs/DATABASE.md): database schema and slot rules (Indonesian)
- [docs/AI.md](docs/AI.md): intent model, extraction, prompts, guardrails, and evaluation (Indonesian)
- [docs/PANDUAN-ADMIN.md](docs/PANDUAN-ADMIN.md): admin guide (Indonesian)
- [docs/Panduan Penggunaan - DB15-G006.pdf](<docs/Panduan Penggunaan - DB15-G006.pdf>): product user guide (Indonesian)
- [docs/PPT Smart Reschedule Assistant (Indonesia).pdf](<docs/PPT Smart Reschedule Assistant (Indonesia).pdf>): presentation slides (Indonesian)

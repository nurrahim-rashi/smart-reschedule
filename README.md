# Smart Reschedule Assistant

Asisten pemahaman permintaan reschedule berbasis AI untuk **Gymnasyum**.
Capstone Project Dicoding Bootcamp, tim **DB15-G006**.

Customer menulis permintaan pindah jadwal dengan bahasa bebas ("pindahin ke minggu depannya lagi dong"). AI membaca maksudnya, backend mencarikan slot yang cocok, dan admin menyetujui atau menolak dengan draf balasan yang disiapkan Generative AI. Keputusan akhir tetap di tangan admin.

## Fitur

**Member**

- Booking jadwal: slot tiap jam, setiap hari 07:00–21:00, maksimal 30 hari ke depan
- Reschedule dengan pesan bebas: AI membaca intent dan preferensi waktu, lalu merekomendasikan slot beserta alternatifnya
- Pembatalan jadwal
- Riwayat request dan pembatalan di halaman Status Request

**Admin**

- Daftar request per status: Pending, Disetujui, Ditolak, Dibatalkan
- Hasil analisis AI: intent, confidence, preferensi, dan permintaan lain di pesan yang sama
- Draf balasan AI sesuai keputusan (setuju, atau tolak dengan slot alternatif) yang bisa diedit

**AI**

- Klasifikasi 5 intent (BiLSTM + lapisan kata kunci tahan typo)
- Ekstraksi hari, waktu, dan jam, termasuk waktu relatif ("besok", "3 minggu lagi", "bulan depan")
- Draf balasan dengan Gemini, divalidasi agar hanya menyebut slot dari database
- Tanya jawab FAQ dengan RAG (ChromaDB + embedding multilingual)

## Arsitektur

```
frontend (React, :5173)
    │  REST + JWT                 │  analisis pesan
    ▼                             ▼
backend (Hapi, :5000) ───────► ai-service (FastAPI, :8000)
    │                              ├─ BiLSTM (intent)
    ▼                              ├─ Gemini (draf balasan)
PostgreSQL                         └─ ChromaDB (RAG FAQ)
```

| Folder                     | Isi                                              |
| -------------------------- | ------------------------------------------------ |
| [frontend/](frontend/)     | React + Vite, Tailwind CSS + daisyUI             |
| [backend/](backend/)       | Hapi (Node.js), PostgreSQL, node-pg-migrate, JWT |
| [ai-service/](ai-service/) | FastAPI, TensorFlow (BiLSTM), Gemini, ChromaDB   |
| [docs/](docs/)             | Dokumentasi API, database, AI, dan panduan admin |

## Menjalankan secara lokal

Kebutuhan: Node.js 20+, Python 3.11+, PostgreSQL, dan API key Gemini ([Google AI Studio](https://aistudio.google.com/apikey)).

### 1. Database dan backend

```bash
psql -U postgres -h localhost -c "CREATE DATABASE gymnasyum"
cd backend
cp .env.example .env
npm install
npm run migrate up
npm run start:dev
```

Isi `PGPASSWORD` dan `ACCESS_TOKEN_KEY` di `backend/.env` sebelum menjalankan. Saat start, backend otomatis membuat slot untuk `SLOT_DAYS_AHEAD` hari ke depan.

> Di macOS, port 5000 dipakai AirPlay Receiver. Matikan di System Settings › General › AirDrop & Handoff, atau ganti `PORT`.

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

Isi `GEMINI_API_KEY` di `ai-service/.env`. `build_index.py` mengunduh model embedding (sekitar 470 MB) saat pertama kali dijalankan.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Buka http://localhost:5173.

### Akun

Tidak ada akun bawaan. Daftar lewat halaman Register (otomatis role `customer`). Untuk membuat admin:

```bash
psql -U postgres -h localhost -d gymnasyum -c "UPDATE users SET role='admin' WHERE email='admin@contoh.com'"
```

`backend/seed.sql` melakukan hal yang sama untuk `admin@contoh.com`, sekaligus memberi satu booking contoh untuk `customer@contoh.com`. Jalankan setelah kedua akun didaftarkan dan backend pernah start sekali.

## Pengujian

```bash
cd backend && npm test
cd frontend && npm test
cd ai-service && python -m unittest test_intent.py test_extractor.py test_generator.py test_rag.py
```

Evaluasi AI (membutuhkan model dan, untuk draf, API key Gemini):

| Script                  | Yang diukur                                 | Hasil terakhir                      |
| ----------------------- | ------------------------------------------- | ----------------------------------- |
| `python eval_intent.py` | Intent pada test set independen (100 pesan) | BiLSTM 95%, BiLSTM + kata kunci 96% |
| `python eval_drafts.py` | Kualitas draf balasan Gemini (12 skenario)  | 12/12 lolos semua cek               |
| `python eval_rag.py`    | Ketepatan retrieval FAQ (20 pertanyaan)     | Top-1 16/20, top-3 19/20            |

## Dokumentasi

- [docs/API.md](docs/API.md): endpoint backend dan AI service
- [docs/DATABASE.md](docs/DATABASE.md): skema database dan aturan slot
- [docs/AI.md](docs/AI.md): model intent, ekstraksi, prompt, guardrail, dan evaluasi
- [docs/PANDUAN-ADMIN.md](docs/PANDUAN-ADMIN.md): panduan penggunaan untuk admin
- [docs/Panduan Penggunaan - DB15-G006.pdf](<docs/Panduan Penggunaan - DB15-G006.pdf>): panduan penggunaan produk lengkap untuk member dan admin, dengan screenshot

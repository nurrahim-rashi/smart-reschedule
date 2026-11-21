# Panduan Deploy

| Bagian | Platform | Alasan |
|---|---|---|
| AI service | Hugging Face Spaces (Docker, CPU basic gratis) | TensorFlow + model embedding butuh RAM besar; paket gratisnya 16 GB |
| Backend + PostgreSQL | Railway | Backend dan database dalam satu project, variabel `PG*` tersedia otomatis |
| Frontend | Vercel | Gratis, terhubung langsung ke GitHub, cocok untuk Vite |

Urutannya penting, karena setiap layanan butuh URL layanan sebelumnya:

```
1. AI service (Hugging Face) ──► URL AI
2. Backend (Railway)         ──► URL backend      (butuh URL AI)
3. Frontend (Vercel)         ──► URL frontend     (butuh URL AI + backend)
4. Kembali ke Hugging Face: izinkan URL frontend lewat CORS_ORIGINS
```

Pastikan semua kode sudah di-push ke GitHub sebelum mulai.

---

## 1. AI service di Hugging Face Spaces

1. Buat akun di https://huggingface.co, lalu buat Space baru di https://huggingface.co/new-space:
   - **Space name**: misalnya `smart-reschedule-ai`
   - **SDK**: Docker, template **Blank**
   - **Hardware**: CPU basic (gratis)
2. Buat token dengan akses **Write** di https://huggingface.co/settings/tokens.
3. Upload isi folder `ai-service` ke Space:

   ```bash
   pip install -U huggingface_hub
   hf auth login
   cd ai-service
   hf upload USERNAME/smart-reschedule-ai . --repo-type=space \
     --exclude "venv/*" ".env" "__pycache__/*" "rag/chroma_db/*" "intent_classifier/*" "README.md" "eval_*.json"
   ```

   Ganti `USERNAME` dengan username Hugging Face. `README.md` sengaja tidak diupload, karena Space memakai README-nya sendiri yang berisi pengaturan Docker. Pada versi `huggingface_hub` lama, ganti `hf` dengan `huggingface-cli`.
4. Di Space, buka **Settings › Variables and secrets**, lalu tambahkan **secret**:

   | Nama | Isi |
   |---|---|
   | `GEMINI_API_KEY` | API key Gemini |
   | `CORS_ORIGINS` | sementara `http://localhost:5173`, diganti di langkah 4 |

5. Tunggu build selesai (tab **Logs**, sekitar 10–20 menit untuk build pertama). URL AI service berbentuk `https://USERNAME-smart-reschedule-ai.hf.space`. Cek dengan membuka `/health` di URL itu.

## 2. Backend dan database di Railway

1. Buat akun di https://railway.com, lalu **New Project › Deploy from GitHub repo**, pilih repo ini.
2. Di service yang terbuat, buka **Settings**:
   - **Root Directory**: `backend`
   - Start command diambil otomatis dari `backend/railway.json` (`npm run migrate up && npm start`), sehingga migration jalan di setiap deploy. Jika tidak terbaca, isi manual di **Settings › Deploy › Custom Start Command**.
3. Tambahkan database: **New › Database › PostgreSQL** di project yang sama.
4. Di service backend, buka **Variables**, lalu isi:

   | Nama | Isi |
   |---|---|
   | `PGHOST` | `${{Postgres.PGHOST}}` |
   | `PGPORT` | `${{Postgres.PGPORT}}` |
   | `PGUSER` | `${{Postgres.PGUSER}}` |
   | `PGPASSWORD` | `${{Postgres.PGPASSWORD}}` |
   | `PGDATABASE` | `${{Postgres.PGDATABASE}}` |
   | `HOST` | `0.0.0.0` |
   | `ACCESS_TOKEN_KEY` | string acak yang panjang |
   | `ACCESS_TOKEN_AGE` | `10800` |
   | `AI_SERVICE_URL` | URL Hugging Face dari langkah 1 |
   | `APP_TIMEZONE` | `Asia/Jakarta` |
   | `SLOT_CAPACITY` | `20` |
   | `SLOT_DAYS_AHEAD` | `30` |

   `PORT` tidak perlu diisi, karena Railway mengisinya otomatis. `HOST=0.0.0.0` wajib, supaya backend menerima koneksi dari luar container.
5. **Settings › Networking › Generate Domain**. URL backend berbentuk `https://nama-backend.up.railway.app`. Jika berhasil, membuka URL itu menampilkan `Gymnasyum API jalan`.

## 3. Frontend di Vercel

1. Buat akun di https://vercel.com, lalu **Add New › Project**, import repo ini.
2. **Root Directory**: `frontend`. Framework terdeteksi otomatis sebagai Vite.
3. **Environment Variables**:

   | Nama | Isi |
   |---|---|
   | `VITE_API_URL` | URL backend dari langkah 2 |
   | `VITE_AI_URL` | URL AI service dari langkah 1 |

4. **Deploy**. URL frontend berbentuk `https://nama-project.vercel.app`.

`frontend/vercel.json` mengarahkan semua halaman ke `index.html`, sehingga membuka langsung `/member` atau me-refresh halaman tidak menghasilkan 404.

Variabel `VITE_*` dibaca saat build. Jika diubah, lakukan **Redeploy**.

## 4. Izinkan frontend di AI service

Kembali ke Space Hugging Face, ubah secret `CORS_ORIGINS` menjadi URL Vercel, misalnya `https://nama-project.vercel.app`. Untuk beberapa URL, pisahkan dengan koma. Space akan restart otomatis.

## 5. Membuat akun admin

1. Daftar akun baru lewat halaman Register di website.
2. Di Railway, buka database PostgreSQL › **Data** (atau **Query**), lalu jalankan:

   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'email-admin@contoh.com';
   ```

3. Login ulang dengan akun tersebut.

---

## Catatan

- **Space gratis tidur** setelah beberapa waktu tidak dipakai. Request pertama setelah tidur bisa memakan 1–2 menit karena model dimuat ulang. Buka website beberapa menit sebelum demo.
- **Kredit Railway** terbatas pada paket percobaan. Cek sisa kredit menjelang presentasi.
- **AI service bersifat publik**, karena frontend memanggilnya langsung. Siapa pun yang tahu URL-nya bisa memakai kuota Gemini.
- `FORCE_IPV4` tidak perlu diisi di server. Opsi itu hanya untuk jaringan lokal yang koneksi IPv6-nya ke Google bermasalah.

## Jika ada masalah

| Gejala | Penyebab yang mungkin |
|---|---|
| Build Space gagal saat `pip install` | Lihat tab **Logs**; biasanya kehabisan waktu atau ada versi paket yang tidak tersedia |
| Frontend kosong atau gagal login | `VITE_API_URL` salah atau belum redeploy setelah diubah |
| Error CORS di console browser saat analisis AI | URL Vercel belum ada di `CORS_ORIGINS` |
| Register menghasilkan 500 | Variabel `PG*` di Railway belum terhubung ke database |
| Draf AI selalu dari template | `GEMINI_API_KEY` di Space belum diisi atau salah |
| Backend tidak bisa diakses dari luar | `HOST` belum diisi `0.0.0.0` |

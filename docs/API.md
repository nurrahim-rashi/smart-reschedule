# Dokumentasi API

## Backend (Hapi, `http://localhost:5000`)

### Format umum

Semua response memakai amplop yang sama:

```json
{ "status": "success", "message": "...", "data": { } }
```

Error dari validasi atau aturan bisnis:

```json
{ "status": "fail", "message": "Slot sudah penuh" }
```

| Kode | Arti |
|---|---|
| 400 | Payload tidak valid atau aturan bisnis dilanggar |
| 401 | Token tidak ada atau tidak valid |
| 403 | Bukan admin untuk endpoint admin |
| 404 | Data tidak ditemukan, termasuk milik user lain |
| 500 | Kesalahan server |

Endpoint bertanda **Auth** membutuhkan header `Authorization: Bearer <accessToken>`.

---

### Autentikasi dan user

#### `POST /users`
Mendaftarkan member baru (role `customer`).

```json
{ "name": "Budi", "email": "budi@contoh.com", "phone": "0812...", "password": "rahasia" }
```

`phone` opsional, `password` minimal 6 karakter. Response `201`: `{ "userId": 1 }`.

#### `POST /authentications`
Login.

```json
{ "email": "budi@contoh.com", "password": "rahasia" }
```

Response: `{ "accessToken": "..." }`. Token berisi `id` dan `role`, berlaku `ACCESS_TOKEN_AGE` detik.

#### `GET /users/me` · Auth
Response: `{ "user": { "id", "name", "email", "phone", "role" } }`.

---

### Slot

Slot dibuat otomatis tiap jam, 07:00–20:00 WIB (selesai 21:00), untuk `SLOT_DAYS_AHEAD` hari ke depan. Label slot berformat `"Sabtu, 28 Nov 08:00"`.

#### `GET /time-slots/available` · Auth
Slot yang belum lewat, masih ada kapasitas, dan masih dalam batas hari.

```json
{
  "timeSlots": [
    {
      "id": 12, "sessionType": "Gym",
      "startTime": "2026-11-28T01:00:00.000Z", "endTime": "2026-11-28T02:00:00.000Z",
      "remaining": 18, "label": "Sabtu, 28 Nov 08:00",
      "day": "sabtu", "dateKey": "2026-11-28", "hour": 8
    }
  ]
}
```

#### `GET /time-slots/recommendations` · Auth
Rekomendasi slot dari preferensi hasil analisis AI.

| Query | Contoh | Keterangan |
|---|---|---|
| `day` | `sabtu`, `besok`, `3 minggu lagi`, `minggu depan`, `1 bulan lagi` | Opsional |
| `period` | `pagi`, `siang`, `sore`, `malam` | Opsional |
| `time` | `08:00`, `jam 8`, `4 sore` | Opsional |
| `excludeSlotId` | `7` | Jadwal member saat ini. Jika `time` dan `period` kosong, jam jadwal ini dipakai sebagai preferensi |

Response:

```json
{
  "matched": [ { "...slot": "", "label": "Sabtu, 12 Des 10:00" } ],
  "alternatives": [ { "...slot": "", "reason": "Minggu yang sama, jam lain" } ],
  "assumedHour": 10,
  "clampedToMaxDate": false,
  "maxDays": 30,
  "maxDateLabel": "Minggu, 20 Des"
}
```

- `alternatives` berisi sampai 6 slot cadangan dengan `reason`: `Hari sama, jam lain`, `Minggu yang sama`, `Jam sama, hari lain`, `Waktu sama, hari lain`, `Tanggal terdekat`, atau `Slot terdekat`.
- `clampedToMaxDate: true` berarti tanggal yang diminta melewati batas, dan rekomendasi ditahan ke `maxDateLabel`.

#### `GET /time-slots` · Auth
Semua slot aktif (data mentah).

---

### Booking

#### `POST /bookings` · Auth
```json
{ "slotId": 12 }
```
Response `201`: `{ "bookingId": 5 }`. Ditolak jika slot penuh, sudah lewat, tidak aktif, atau sudah dibooking oleh member yang sama.

#### `GET /bookings/me` · Auth
Booking aktif milik member, urut dari yang paling dekat.

```json
{ "bookings": [ { "id": 5, "slotId": 12, "schedule": "Sabtu, 28 Nov 08:00", "startTime": "...", "day": "sabtu", "dateKey": "2026-11-28", "hour": 8 } ] }
```

#### `GET /bookings/me/cancelled` · Auth
Booking yang sudah dibatalkan, dengan `cancelledAt`.

#### `POST /bookings/{id}/cancel` · Auth
Membatalkan booking milik sendiri yang belum berjalan. Request reschedule yang masih pending untuk booking itu ikut berstatus `cancelled`. Response: `{ "closedRequests": 1 }`.

---

### Request reschedule

Status: `pending`, `approved`, `rejected`, `cancelled` (booking dibatalkan member sebelum diputuskan).

#### `POST /reschedule-requests` · Auth
```json
{ "bookingId": 5, "requestedSlotId": 20, "message": "pindah ke Sabtu pagi ya" }
```
Response `201`: `{ "requestId": 3 }`. Backend lalu memanggil AI service (`/draft-reply`) dan menyimpan hasilnya ke `ai_analyses` dan `reply_drafts`. Jika AI service gagal, request tetap tersimpan tanpa analisis. Satu booking hanya boleh punya satu request `pending`.

#### `GET /reschedule-requests/me` · Auth
```json
{ "rescheduleRequests": [ { "id": 3, "oldSchedule": "Selasa, 24 Nov 10:00", "newSchedule": "Sabtu, 28 Nov 08:00", "message": "...", "status": "pending", "adminNote": null, "reviewedAt": null, "createdAt": "..." } ] }
```

#### `GET /reschedule-requests` · Auth (admin)
Query opsional `status`. Setiap item ditambah:

```json
{
  "customer": { "id": 1, "name": "Budi", "phone": null },
  "aiAnalysis": {
    "intent": "reschedule", "confidence": 0.99,
    "preferredDay": "sabtu", "preferredPeriod": "pagi", "preferredTime": null,
    "otherIntents": ["cancel"]
  },
  "draftReply": { "text": "Halo Kak Budi, ...", "source": "gemini", "needsReview": false }
}
```

#### `POST /reschedule-requests/{id}/decision-draft` · Auth (admin)
Membuat draf balasan sesuai keputusan admin.

```json
{ "decision": "rejected", "reason": "slot penuh" }
```

`decision`: `approved` atau `rejected`. `reason` opsional. Saat `rejected`, backend mencari 3 slot alternatif dari preferensi customer. Response `201`:

```json
{ "draftReply": { "text": "...", "source": "gemini", "needsReview": false }, "alternatives": ["Minggu, 29 Nov 08:00"] }
```

#### `POST /reschedule-requests/{id}/approve` · Auth (admin)
#### `POST /reschedule-requests/{id}/reject` · Auth (admin)
```json
{ "adminNote": "Siap kak, sudah dipindah" }
```
Approve memindahkan booking ke slot baru dalam satu transaksi dan menolak jika slot sudah penuh.

---

## AI service (FastAPI, `http://localhost:8000`)

Dokumentasi interaktif tersedia di `http://localhost:8000/docs`.

| Endpoint | Dipakai oleh | Fungsi |
|---|---|---|
| `GET /health` | | Cek status |
| `GET /model-info` | | Nama model dan daftar intent |
| `POST /predict` | | Intent dari model BiLSTM saja (untuk evaluasi) |
| `POST /analyze-message` | Frontend | Intent, preferensi, dan intent lain |
| `POST /draft-reply` | Backend | Analisis + draf balasan saat request diajukan |
| `POST /decision-reply` | Backend | Draf balasan setelah admin memutuskan |
| `POST /generate-reply` | | Draf balasan dari intent dan slot |
| `POST /chat` | | Tanya jawab FAQ (RAG) |

#### `POST /analyze-message`
```json
{ "message": "Yang Rabu batalin ya, terus yang Sabtu pindah ke Minggu pagi" }
```
```json
{
  "intent": "reschedule", "confidence": 0.99, "intent_source": "model",
  "other_intents": ["cancel"],
  "preferred_day": "minggu", "preferred_period": "pagi", "preferred_time": null
}
```

`intent_source` bernilai `keyword` jika hasil model dikoreksi oleh aturan kata kunci (lihat [AI.md](AI.md)).

#### `POST /draft-reply`
```json
{ "message": "...", "slots": ["Sabtu, 28 Nov 08:00"], "customer_name": "Budi", "current_schedule": "Selasa, 24 Nov 10:00" }
```
Response: hasil analisis seperti di atas, ditambah `draft_reply`, `source` (`gemini`, `fallback`, atau `low_confidence`) dan `needs_review`.

#### `POST /decision-reply`
```json
{
  "decision": "rejected", "old_schedule": "Selasa, 24 Nov 10:00", "new_schedule": "Sabtu, 28 Nov 08:00",
  "alternatives": ["Minggu, 29 Nov 08:00"], "customer_name": "Budi", "message": "...", "reason": "slot penuh"
}
```
Response: `{ "draft_reply": "...", "source": "gemini" }`.

#### `POST /chat`
```json
{ "question": "Gym buka jam berapa?" }
```
Response: `{ "question": "...", "answer": "..." }`.

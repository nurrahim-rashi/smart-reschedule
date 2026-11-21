# Panduan Admin

Panduan memakai Smart Reschedule Assistant untuk admin Gymnasyum.

## Masuk sebagai admin

1. Buka aplikasi dan login dengan akun admin.
2. Kamu langsung diarahkan ke **Dashboard Admin**. Halaman khusus member (Booking, Reschedule, Status Request) tidak bisa dibuka dengan akun admin.

Akun admin dibuat dengan mendaftar biasa, lalu role-nya diubah di database (lihat README).

## Dashboard Admin

Di bagian atas ada empat angka: **Menunggu**, **Disetujui**, **Ditolak**, dan **Dibatalkan**. Di bawahnya, request dikelompokkan dalam tab dengan nama yang sama.

| Tab | Isi |
|---|---|
| Pending | Request yang perlu kamu putuskan |
| Disetujui | Jadwal member sudah dipindah |
| Ditolak | Request yang kamu tolak |
| Dibatalkan | Member membatalkan jadwalnya sebelum request diputuskan |

## Memproses request

Setiap request di tab **Pending** menampilkan:

- **Nama member, jadwal lama, dan jadwal baru** yang dipilih member.
- **Pesan member**, apa adanya.
- **Hasil analisis AI:**
  - Intent dan tingkat keyakinannya, misalnya *Reschedule (99%)*.
  - Hari, waktu, dan jam yang diminta.
  - Badge kuning **"Juga berisi: …"** jika pesan memuat permintaan lain, misalnya pembatalan jadwal lain. Tangani permintaan itu terpisah.
  - Peringatan jika AI tidak membaca pesan sebagai permintaan reschedule. Baca pesannya dulu sebelum memutuskan.

### Langkah

1. Baca pesan member dan cek apakah jadwal baru sesuai permintaannya.
2. Buat draf balasan:
   - **Draf AI: Setujui** untuk konfirmasi perpindahan jadwal.
   - **Draf AI: Tolak + Alternatif** untuk penolakan. Isi alasan (opsional, misalnya "instruktur berhalangan") di kolom sebelahnya. AI akan menawarkan sampai 3 slot lain yang paling dekat dengan permintaan member.
3. Draf otomatis masuk ke **Catatan Admin**. Periksa dan edit sesuai kebutuhan.
   - Jika muncul keterangan "AI sedang tidak tersedia, draf diisi dari template", draf berasal dari template, bukan AI.
   - Draf AI sudah dicek otomatis agar hanya menyebut jadwal yang ada di sistem, tapi tetap baca sebelum dikirim. Contohnya, AI kadang salah menulis nama "Gymnasyum".
4. Klik **Setujui** atau **Tolak**.
   - **Setujui** langsung memindahkan jadwal member ke slot baru. Jika slot itu sudah penuh, sistem menolak dan menampilkan pesan.
   - Catatan Admin dikirim ke member dan terlihat di halaman Status Request mereka.

Kamu juga bisa menulis Catatan Admin sendiri tanpa memakai tombol Draf AI.

## Yang dilihat member

Member melihat status request (Pending, Disetujui, Ditolak, Dibatalkan), jadwal lama dan baru, serta Catatan Admin di halaman **Status Request**. Belum ada notifikasi otomatis, jadi jika perlu, kirim juga balasannya lewat WhatsApp. Catatan Admin bisa disalin langsung.

## Aturan jadwal

- Slot tersedia setiap hari pukul 07:00–21:00, masing-masing 1 jam.
- Member hanya bisa memilih jadwal sampai 30 hari ke depan.
- Kapasitas per slot diatur lewat `SLOT_CAPACITY` (default 20).
- Satu jadwal hanya bisa punya satu request yang menunggu keputusan.

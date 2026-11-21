-- Jalankan setelah backend pernah start sekali (slot tiap jam dibuat otomatis saat start)
-- dan setelah akun customer@contoh.com & admin@contoh.com didaftarkan lewat halaman Register.

-- Booking contoh: customer ikut slot besok jam 10:00 WIB
INSERT INTO bookings (customer_id, slot_id)
SELECT u.id, ts.id
FROM users u, time_slots ts
WHERE u.email = 'customer@contoh.com'
AND ts.start_time = (date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') + interval '1 day 10 hours') AT TIME ZONE 'Asia/Jakarta'
ON CONFLICT DO NOTHING;

UPDATE users SET role = 'admin' WHERE email = 'admin@contoh.com';

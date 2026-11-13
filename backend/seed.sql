INSERT INTO time_slots (start_time, end_time, session_type, capacity) VALUES
('2026-12-05 08:00+07', '2026-12-05 09:00+07', 'Yoga', 10),
('2026-12-05 10:00+07', '2026-12-05 11:00+07', 'Yoga', 10),
('2026-12-06 09:00+07', '2026-12-06 10:00+07', 'Yoga', 10),
('2026-12-06 16:00+07', '2026-12-06 17:00+07', 'Yoga', 10),
('2026-12-09 18:00+07', '2026-12-09 19:00+07', 'Pilates', 8),
('2026-12-10 18:00+07', '2026-12-10 19:00+07', 'Pilates', 8);

INSERT INTO bookings (customer_id, slot_id)
SELECT u.id, ts.id
FROM users u, time_slots ts
WHERE u.email = 'customer@contoh.com'
AND ts.session_type = 'Yoga'
AND ts.start_time = '2026-12-05 08:00+07';

UPDATE users SET role = 'admin' WHERE email = 'admin@contoh.com';
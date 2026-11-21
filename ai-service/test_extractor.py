"""
Unit test ekstraksi preferensi hari, waktu, dan jam dari pesan customer.

Jalankan:
    python -m unittest test_extractor.py
"""

import unittest

from extractor import extract_preferences


class ExtractPreferencesTest(unittest.TestCase):

    def assertPreferences(self, message, expected):

        self.assertEqual(extract_preferences(message), expected)

    def test_ambil_hari_tujuan_bukan_jadwal_lama(self):

        self.assertPreferences("Jadwal Rabu aku pindah ke Sabtu ya", ("sabtu", None, None))

    def test_hari_periode_dan_jam_tujuan(self):

        self.assertPreferences(
            "Rabu pagi jam 10:00 saya ga bisa, ke Kamis sore jam 15:00 aja",
            ("kamis", "sore", "15:00")
        )

    def test_hari_relatif(self):

        self.assertPreferences("Hari ini nggak bisa, besok bisa?", ("besok", None, None))

    def test_minggu_depan_bukan_hari_minggu(self):

        self.assertPreferences("Minggu ini saya sibuk, bisa geser ke minggu depan?", ("minggu depan", None, None))

    def test_beberapa_minggu_lagi_bukan_hari_minggu(self):

        self.assertPreferences("pidnahin ke 3 minggu lagi", ("3 minggu lagi", None, None))

    def test_angka_dalam_kata_diseragamkan(self):

        self.assertPreferences("pindahin ke seminggu lagi", ("1 minggu lagi", None, None))
        self.assertPreferences("geser ke dua minggu lagi sore ya", ("2 minggu lagi", "sore", None))

    def test_beberapa_hari_lagi(self):

        self.assertPreferences("minta pindah 5 hari lagi jam 8 pagi", ("5 hari lagi", "pagi", "jam 8"))

    def test_hari_minggu_tetap_terbaca(self):

        self.assertPreferences("Pindah ke hari Minggu jam 9 pagi", ("minggu", "pagi", "jam 9"))

    def test_format_jam_titik(self):

        self.assertPreferences("Sabtu 08.30 bisa?", ("sabtu", None, "08.30"))

    def test_pertanyaan_jadwal_tanpa_penanda(self):

        self.assertPreferences("Jadwal saya hari Rabu jam berapa?", ("rabu", None, None))

    def test_huruf_besar_tidak_berpengaruh(self):

        self.assertPreferences("PINDAH KE JUMAT SORE", ("jumat", "sore", None))

    def test_pesan_tanpa_preferensi(self):

        self.assertPreferences("Terima kasih kak", (None, None, None))


if __name__ == "__main__":
    unittest.main()

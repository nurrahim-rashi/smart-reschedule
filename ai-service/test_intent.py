"""
Unit test klasifikasi intent gabungan (model + kata kunci).
Model di-mock supaya test tidak bergantung pada TensorFlow.

Jalankan:
    python -m unittest test_intent.py
"""

import unittest
from unittest.mock import patch

from intent import (
    KEYWORD_CONFIDENCE,
    RESCHEDULE_KEYWORDS,
    classify_intent,
    detect_other_intents,
    has_keyword,
    split_clauses,
)


@patch("intent.predict_intent")
class ClassifyIntentTest(unittest.TestCase):

    def test_typo_pindah_dikoreksi_jadi_reschedule(self, predict):

        predict.return_value = ("confirmation", 0.78)

        self.assertEqual(
            classify_intent("pidnahin ke 3 minggu lagi"),
            ("reschedule", KEYWORD_CONFIDENCE, "keyword")
        )

    def test_hasil_model_dipakai_jika_sudah_benar(self, predict):

        predict.return_value = ("reschedule", 0.99)

        self.assertEqual(
            classify_intent("pindah ke sabtu"),
            ("reschedule", 0.99, "model")
        )

    def test_kata_kunci_batal_dikoreksi_jadi_cancel(self, predict):

        predict.return_value = ("other", 0.5)

        self.assertEqual(classify_intent("gak jadi ikut kelas ya")[0], "cancel")

    def test_pesan_ambigu_diserahkan_ke_model(self, predict):

        predict.return_value = ("cancel", 0.6)

        self.assertEqual(
            classify_intent("tolong batalin tapi pindah aja deh"),
            ("cancel", 0.6, "model")
        )

    def test_konfirmasi_pindah_tetap_confirmation(self, predict):

        predict.return_value = ("confirmation", 0.997)

        self.assertEqual(
            classify_intent("Mantap kak, jadi pindah ke Senin ya. Saya ok."),
            ("confirmation", 0.997, "model")
        )

    def test_tanpa_kata_kunci_pakai_model(self, predict):

        predict.return_value = ("confirmation", 0.95)

        self.assertEqual(
            classify_intent("oke kak siap"),
            ("confirmation", 0.95, "model")
        )


class HasKeywordTest(unittest.TestCase):

    def test_typo_umum_dikenali(self):

        for word in ["pidnahin", "pindahn", "pindh", "reskedul"]:

            self.assertTrue(has_keyword(word, RESCHEDULE_KEYWORDS), word)

    def test_kata_lain_yang_mirip_tidak_dikenali(self):

        for word in ["pinjam", "pidana", "tindak", "tanah", "minggu"]:

            self.assertFalse(has_keyword(word, RESCHEDULE_KEYWORDS), word)

    def test_frasa_dicocokkan_persis(self):

        self.assertTrue(has_keyword("mau ganti jadwal dong", RESCHEDULE_KEYWORDS))


def fake_model(text):
    """Model tiruan: tebak intent dari kata kunci sederhana per bagian kalimat."""

    text = text.lower()

    if "batal" in text:
        return "cancel", 0.95
    if "pindah" in text or "geser" in text:
        return "reschedule", 0.95
    if "jam berapa" in text:
        return "schedule_inquiry", 0.95
    if "acara" in text:
        # Kalimat alasan yang sering keliru terbaca cancel oleh model asli
        return "cancel", 0.97

    return "other", 0.5


@patch("intent.predict_intent", side_effect=fake_model)
class DetectOtherIntentsTest(unittest.TestCase):

    def test_batal_sekaligus_pindah(self, _):

        message = "Yang Rabu tolong batalin ya, terus yang Sabtu pindah ke Minggu pagi"

        self.assertEqual(detect_other_intents(message, "reschedule"), ["cancel"])

    def test_tanya_jadwal_sekaligus_pindah(self, _):

        message = "Mau tanya jadwal saya jam berapa, sekalian mau pindah ke Jumat sore"

        self.assertEqual(detect_other_intents(message, "reschedule"), ["schedule_inquiry"])

    def test_kalimat_alasan_tidak_dihitung(self, _):

        message = "Boleh nggak sesi Kamis aku pindah ke Jumat pagi? lagi ada acara keluarga"

        self.assertEqual(detect_other_intents(message, "reschedule"), [])

    def test_pesan_satu_kalimat(self, _):

        self.assertEqual(detect_other_intents("Besok sore nggak bisa, pindah Sabtu pagi dong", "reschedule"), [])


class SplitClausesTest(unittest.TestCase):

    def test_dipecah_per_kalimat_dan_kata_sambung(self):

        self.assertEqual(
            split_clauses("Batalkan sesi besok. Lalu sesi Kamis tolong geser ke Sabtu"),
            ["Batalkan sesi besok", "sesi Kamis tolong geser ke Sabtu"]
        )

    def test_bagian_terlalu_pendek_diabaikan(self):

        self.assertEqual(split_clauses("Oke. Siap kak makasih"), ["Siap kak makasih"])


if __name__ == "__main__":
    unittest.main()

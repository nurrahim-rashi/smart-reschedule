"""
Unit test klasifikasi intent gabungan (model + kata kunci).
Model di-mock supaya test tidak bergantung pada TensorFlow.

Jalankan:
    python -m unittest test_intent.py
"""

import unittest
from unittest.mock import patch

from intent import KEYWORD_CONFIDENCE, classify_intent, has_keyword, RESCHEDULE_KEYWORDS


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


if __name__ == "__main__":
    unittest.main()

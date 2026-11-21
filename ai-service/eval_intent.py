"""
Evaluasi klasifikasi intent pada test set independen (100 pesan).

Jalankan:
    python eval_intent.py

Yang dibandingkan:
- model   : BiLSTM saja (predict_intent)
- aplikasi: BiLSTM + lapisan kata kunci (classify_intent), yang dipakai di API

Test set ini tidak dipakai saat training, dan setiap pesan punya tag
gaya bahasa (formal, informal, negasi, typo, dst.) untuk melihat kelemahan model.
"""

import csv
import json
from collections import Counter, defaultdict
from pathlib import Path

from sklearn.metrics import classification_report, confusion_matrix

from intent import classify_intent
from predictor import predict_intent


TEST_SET = Path(__file__).parent / "intent_classifier" / "independent_test_set.csv"

LABELS = ["reschedule", "cancel", "schedule_inquiry", "confirmation", "other"]


def load_cases():

    with open(TEST_SET, encoding="utf-8") as f:

        return list(csv.DictReader(f))


def evaluate(name, cases, predict):

    expected = [case["intent"] for case in cases]
    predicted = [predict(case["message"]) for case in cases]

    correct = sum(e == p for e, p in zip(expected, predicted))

    print(f"\n===== {name} =====")
    print(f"Akurasi: {correct}/{len(cases)} ({correct / len(cases):.1%})\n")

    print(classification_report(expected, predicted, labels=LABELS, digits=3, zero_division=0))

    print("Confusion matrix (baris = label asli, kolom = prediksi):")
    print(f"{'':>18}" + "".join(f"{label[:10]:>12}" for label in LABELS))

    for label, row in zip(LABELS, confusion_matrix(expected, predicted, labels=LABELS)):

        print(f"{label:>18}" + "".join(f"{value:>12}" for value in row))

    # Akurasi per tag gaya bahasa
    per_tag = defaultdict(Counter)

    for case, pred in zip(cases, predicted):

        for tag in filter(None, case.get("tags", "").split("|")):

            per_tag[tag]["total"] += 1
            per_tag[tag]["benar"] += case["intent"] == pred

    print("\nAkurasi per tag:")

    for tag, count in sorted(per_tag.items()):

        print(f"  {tag:<14} {count['benar']}/{count['total']}")

    errors = [
        {"message": case["message"], "expected": case["intent"], "predicted": pred, "tags": case.get("tags", "")}
        for case, pred in zip(cases, predicted)
        if case["intent"] != pred
    ]

    print(f"\nSalah prediksi ({len(errors)}):")

    for error in errors:

        print(f"  - [{error['expected']} -> {error['predicted']}] {error['message']}")

    return {
        "accuracy": correct / len(cases),
        "correct": correct,
        "total": len(cases),
        "errors": errors,
    }


def main():

    cases = load_cases()

    results = {
        "model": evaluate("BiLSTM saja", cases, lambda text: predict_intent(text)[0]),
        "aplikasi": evaluate("BiLSTM + kata kunci (dipakai aplikasi)", cases, lambda text: classify_intent(text)[0]),
    }

    with open("eval_intent_results.json", "w", encoding="utf-8") as f:

        json.dump(results, f, ensure_ascii=False, indent=2)

    print("\nHasil lengkap disimpan di eval_intent_results.json")


if __name__ == "__main__":
    main()

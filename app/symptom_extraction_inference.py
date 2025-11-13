# symptom_extraction_inference.py
# Lightweight, production-ready NER inference (NO training, NO dataset)

import os
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline

# -------------------------------
# 1. Locate your trained model
# -------------------------------
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "models", "biobert_ner_model")

# -------------------------------
# 2. Load tokenizer + model
# -------------------------------
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, model_max_length=256)
model = AutoModelForTokenClassification.from_pretrained(MODEL_PATH)

ner_pipeline = pipeline(
    "token-classification",
    model=model,
    tokenizer=tokenizer,
    aggregation_strategy="simple"  # merges subwords automatically
)

# -------------------------------
# 3. Clean subwords (##headache → headache)
# -------------------------------
def merge_subwords(results):
    merged = []
    current = ""

    for item in results:
        word = item['word']
        if word.startswith("##"):
            current += word[2:]        # continue previous word
        else:
            if current:
                merged.append(current)
            current = word
    if current:
        merged.append(current)

    return merged


# -------------------------------
# 4. Public function used by pipeline.py
# -------------------------------
def extract_symptoms(text: str):
    """
    Runs NER model and returns detected symptoms as a list of strings.
    """
    raw_results = ner_pipeline(text)
    merged_words = merge_subwords(raw_results)

    # OPTIONAL: Filter only symptom-related tokens
    # Modify if your labels use different names.
    symptoms = [
        item["word"].strip("#")
        for item in raw_results
        if "Symptom" in item["entity_group"] or "Finding" in item["entity_group"]
    ]

    # If your NER labels are B-Symptom / I-Symptom:
    # symptoms = merged_words

    return list(set(symptoms))  # deduplicate

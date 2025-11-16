# app/symptom_extraction.py
"""
Lightweight inference wrapper for BioBERT NER.
Loads model from models/biobert_ner_model if available, otherwise from hub.
Provides: extract_symptoms(text: str) -> List[str]
"""
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline
import torch
import os

_MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models", "biobert_ner_model")
_MODEL_HUB = "d4data/biobert-ner"  # fallback hub model if you want

_ner_pipeline = None

def _load_ner():
    global _ner_pipeline
    if _ner_pipeline is not None:
        return _ner_pipeline

    # prefer local saved model if present
    model_source = _MODEL_DIR if os.path.isdir(_MODEL_DIR) and os.listdir(_MODEL_DIR) else _MODEL_HUB

    device = 0 if torch.cuda.is_available() else -1
    tokenizer = AutoTokenizer.from_pretrained(model_source)
    model = AutoModelForTokenClassification.from_pretrained(model_source)
    _ner_pipeline = pipeline(
        "token-classification",
        model=model,
        tokenizer=tokenizer,
        aggregation_strategy="simple",
        device=device
    )
    return _ner_pipeline

def extract_symptoms(text):
    """
    Input: raw text (string)
    Output: list of extracted symptom strings (cleaned)
    """
    ner = _load_ner()
    raw = ner(text)

    # raw items look like {'entity_group': 'ADR', 'score': 0.9, 'word': 'severe headache', ...}
    # return the words (deduplicated, in order)
    symptoms = []
    seen = set()
    for item in raw:
        word = item.get("word", "").strip()
        if not word:
            continue
        # normalize spacing
        word_norm = " ".join(word.split())
        if word_norm.lower() not in seen:
            seen.add(word_norm.lower())
            symptoms.append(word_norm)
    return symptoms

# quick test when run as script
if __name__ == "__main__":
    print(extract_symptoms("After taking medication I had severe headache and blurred vision."))

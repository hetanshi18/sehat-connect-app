# app/disease_prediction.py
"""
Inference module for disease prediction.
Loads artifacts from models/disease_model_artifacts:
 - model.pkl (trained classifier)
 - label_encoder.pkl
 - symptom_binarizer.pkl
 - symptom_vocab.json (optional)

Provides:
 - predict_disease(symptoms: List[str], top_k=3) -> dict
"""
import os, json, re, string
import joblib
import numpy as np

# fuzzy fallback
try:
    from rapidfuzz import process as fuzzprocess, fuzz
    _HAS_RAPIDFUZZ = True
except Exception:
    import difflib
    _HAS_RAPIDFUZZ = False

BASE = os.path.join(os.path.dirname(__file__), "..")
MODEL_DIR = os.path.join(BASE, "models", "disease_model_artifacts")

_model = None
_label_encoder = None
_mlb = None
_VOCAB = None

def _load_artifacts():
    global _model, _label_encoder, _mlb, _VOCAB
    if _model is not None:
        return
    _model = joblib.load(os.path.join(MODEL_DIR, "model.pkl"))
    _label_encoder = joblib.load(os.path.join(MODEL_DIR, "label_encoder.pkl"))
    _mlb = joblib.load(os.path.join(MODEL_DIR, "symptom_binarizer.pkl"))
    vocab_path = os.path.join(MODEL_DIR, "symptom_vocab.json")
    if os.path.exists(vocab_path):
        with open(vocab_path) as f:
            _VOCAB = set(json.load(f))
    else:
        # build from mlb classes if available
        try:
            _VOCAB = set(_mlb.classes_)
        except Exception:
            _VOCAB = set()

def normalize_symptom(s):
    """Light normalization to match the training canonical forms."""
    if s is None:
        return None
    s = str(s).strip().lower()
    s = s.replace("-", " ").replace("/", " ")
    s = re.sub(r"\s+", " ", s)
    s = s.translate(str.maketrans("", "", string.punctuation))
    s = s.strip()
    return s.replace(" ", "_") if s else None

def canonicalize_list(symptoms_raw, threshold=90):
    """Return canonical symptom tokens that align with the training vocab."""
    _load_artifacts()
    canon = []
    for s in symptoms_raw:
        s0 = normalize_symptom(s)
        if not s0:
            continue
        if s0 in _VOCAB:
            canon.append(s0)
            continue
        # fuzzy fallback
        if _HAS_RAPIDFUZZ:
            match, score, _ = fuzzprocess.extractOne(s0, _VOCAB, scorer=fuzz.token_sort_ratio)
            if score >= threshold:
                canon.append(match)
        else:
            # difflib fallback
            matches = difflib.get_close_matches(s0, list(_VOCAB), n=1, cutoff=0.8)
            if matches:
                canon.append(matches[0])
            # otherwise drop
    return sorted(set(canon))

def vectorize(symptoms_norm):
    _load_artifacts()
    return _mlb.transform([symptoms_norm])

def predict_disease(symptoms, top_k=3):
    """
    Input: symptoms (list of strings, unnormalized)
    Output: dict with canonical_symptoms and predictions: [{'disease':..., 'prob':...}, ...]
    """
    _load_artifacts()
    canon = canonicalize_list(symptoms)
    if len(canon) == 0:
        return {"canonical_symptoms": [], "predictions": []}

    Xb = vectorize(canon)
    # ensure model has predict_proba
    if not hasattr(_model, "predict_proba"):
        # try to wrap with CalibratedClassifierCV? But assume training produced prob-capable model
        raise RuntimeError("Loaded disease model has no predict_proba. Re-train or use calibrated model.")
    probs = _model.predict_proba(Xb)[0]  # shape (n_classes,)

    # map
    diseases = list(_label_encoder.classes_)
    # no priors here (kept simple) — you can reintroduce priors if desired
    idxs = np.argsort(probs)[::-1][:top_k]
    preds = [{"disease": diseases[i], "prob": float(probs[i])} for i in idxs]
    return {"canonical_symptoms": canon, "predictions": preds}

# quick demo
if __name__ == "__main__":
    print(predict_disease(["headache", "nausea"], top_k=3))

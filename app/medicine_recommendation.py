# app/medicine_recommendation.py
"""
Lightweight medicine recommender.
Loads:
 - models/meds_model/knn_model.pkl
 - models/meds_model/vectorizer.pkl
 - models/meds_model/disease_medicine.csv

Provides:
 - recommend_meds(disease_name: str) -> (matched_disease, [med1, ...])
"""
import os
import joblib
import pandas as pd

BASE = os.path.join(os.path.dirname(__file__), "..")
MODEL_DIR = os.path.join(BASE, "models", "meds_model")

_knn = None
_vectorizer = None
_df = None

def _load():
    global _knn, _vectorizer, _df
    if _knn is not None:
        return
    _knn = joblib.load(os.path.join(MODEL_DIR, "knn_model.pkl"))
    _vectorizer = joblib.load(os.path.join(MODEL_DIR, "vectorizer.pkl"))
    _df = pd.read_csv(os.path.join(MODEL_DIR, "disease_medicine.csv"))
    _df["Disease_norm"] = _df["Disease"].str.lower().str.strip()

def recommend_meds(disease_name):
    _load()
    q = disease_name.lower().strip()
    if q in _df["Disease_norm"].values:
        row = _df[_df["Disease_norm"] == q].iloc[0]
        matched = row["Disease"]
        meds = [x for x in row[1:].tolist() if str(x).strip()]
        return matched, meds
    # fallback: nearest match using vectorizer + knn
    vec = _vectorizer.transform([q])
    distances, indices = _knn.kneighbors(vec)
    idx = int(indices[0][0])
    row = _df.iloc[idx]
    matched = row["Disease"]
    meds = [x for x in row[1:].tolist() if str(x).strip()]
    return matched, meds

# quick demo
if __name__ == "__main__":
    print(recommend_meds("flu"))

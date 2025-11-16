# app/pipeline.py
from .translate_module import translate_to_en, translate_from_en, detect_language
from .symptom_extraction import extract_symptoms
from .disease_prediction import predict_disease
from .medicine_recommendation import recommend_meds

def health_assistant_pipeline(user_text, translate_back=True):
    # Step 1: detect & translate to English if needed
    english_text, src_lang = translate_to_en(user_text)

    # Step 2: extract symptoms
    symptoms = extract_symptoms(english_text)

    # Step 3: predict disease
    disease_info = predict_disease(symptoms, top_k=3)
    top_disease = disease_info["predictions"][0]["disease"] if disease_info["predictions"] else None

    # Step 4: medicine recommendations
    meds = []
    matched_disease = None
    if top_disease:
        matched_disease, meds = recommend_meds(top_disease)

    # Optional translation of the output summary back to user's language
    translated_summary = None
    if translate_back and src_lang != "en" and top_disease:
        out_text = f"Predicted disease: {top_disease}. Recommended medicines: {', '.join(meds)}"
        translated_summary = translate_from_en(out_text, src_lang)

    return {
        "input": user_text,
        "detected_language": src_lang,
        "english_text": english_text,
        "symptoms": symptoms,
        "disease_info": disease_info,
        "matched_disease_for_meds": matched_disease,
        "medicines": meds,
        "translated_summary": translated_summary
    }

# quick test
if __name__ == "__main__":
    print(health_assistant_pipeline("मुझे सिर में तेज दर्द है और मतली महसूस होती है।"))

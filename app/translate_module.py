# app/translate_module.py
"""
Simple, lazy-loading translation helpers.
 - detect_language(text) -> ISO code
 - translate_to_en(text) -> (english_text, src_lang)
 - translate_from_en(text, target_lang) -> translated_text

Uses Marian models on demand to avoid loading many models at import time.
"""
from langdetect import detect
import os

# mapping of src->model that translates SRC -> EN
MODEL_MAP_TO_EN = {
    "hi": "Helsinki-NLP/opus-mt-hi-en",
    "mr": "Helsinki-NLP/opus-mt-mr-en",
    "gu": "Helsinki-NLP/opus-mt-gu-en",
    "bn": "Helsinki-NLP/opus-mt-bn-en"
}

# mapping of en->tgt models (EN to target language)
MODEL_MAP_FROM_EN = {
    "hi": "Helsinki-NLP/opus-mt-en-hi",
    "mr": "Helsinki-NLP/opus-mt-en-mr",
    "gu": "Helsinki-NLP/opus-mt-en-gu",
    "bn": "Helsinki-NLP/opus-mt-en-bn"
}

# lazy cache
_loaded_translators = {}

def _get_translator(model_name):
    # returns a simple function translator(text)->str
    from transformers import MarianTokenizer, MarianMTModel
    if model_name in _loaded_translators:
        return _loaded_translators[model_name]
    tokenizer = MarianTokenizer.from_pretrained(model_name)
    model = MarianMTModel.from_pretrained(model_name)
    def _translate(text):
        # supports list or string
        inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True)
        out = model.generate(**inputs, max_length=256)
        return tokenizer.decode(out[0], skip_special_tokens=True)
    _loaded_translators[model_name] = _translate
    return _translate

def detect_language(text):
    try:
        lang = detect(text)
        return lang
    except Exception:
        return "en"

def translate_to_en(text):
    """If text is not English and we have a model, translate -> English.
       Returns (english_text, detected_lang)
    """
    lang = detect_language(text)
    if lang == "en":
        return text, "en"
    if lang not in MODEL_MAP_TO_EN:
        return text, lang
    translator = _get_translator(MODEL_MAP_TO_EN[lang])
    return translator(text), lang

def translate_from_en(text, target_lang):
    """Translate english text to target_lang if supported."""
    if target_lang == "en" or target_lang not in MODEL_MAP_FROM_EN:
        return text
    translator = _get_translator(MODEL_MAP_FROM_EN[target_lang])
    return translator(text)

# quick demo
if __name__ == "__main__":
    print(translate_to_en("मुझे सिरदर्द और बुखार है"))

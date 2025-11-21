# main.py
from flask import Flask, request, jsonify
from flask_cors import CORS

from app.pipeline import health_assistant_pipeline
from app.ocr_processor import process_medical_report
import base64

app = Flask(__name__)
CORS(app)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    if not data or "text" not in data:
        return jsonify({"error":"Send JSON with {'text': 'your input'}"}), 400
    result = health_assistant_pipeline(data["text"])
    return jsonify(result)

@app.route("/process-report", methods=["POST"])
def process_report():
    data = request.json
    if not data or "file_data" not in data or "file_type" not in data:
        return jsonify({"error": "Send JSON with {'file_data': 'base64_string', 'file_type': 'pdf|image'}"}), 400
    
    try:
        file_bytes = base64.b64decode(data["file_data"])
        result = process_medical_report(file_bytes, data["file_type"])
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)

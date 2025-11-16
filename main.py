# main.py
from flask import Flask, request, jsonify
from app.pipeline import health_assistant_pipeline

app = Flask(__name__)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    if not data or "text" not in data:
        return jsonify({"error": "Send JSON with {'text': 'your input'}"}), 400
    
    result = health_assistant_pipeline(data["text"])
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)

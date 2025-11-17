# main.py
from flask import Flask, request, jsonify
from flask_cors import CORS            # <-- uncomment / add

from app.pipeline import health_assistant_pipeline

app = Flask(__name__)
# Allow only your frontend origin (safer) or use "*" to allow all origins
#CORS(app, resources={r"/predict": {"origins": "http://localhost:8080"}})
# OR to allow all:
CORS(app)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    if not data or "text" not in data:
        return jsonify({"error":"Send JSON with {'text': 'your input'}"}), 400
    result = health_assistant_pipeline(data["text"])
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)

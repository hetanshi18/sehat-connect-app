from flask import Flask, request, jsonify
from flask_cors import CORS
from app.pipeline import health_assistant_pipeline
from app.ocr_processor import process_medical_report, get_specific_insight
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    if not data or "text" not in data:
        return jsonify({"error": "Send JSON with {'text': 'your input'}"}), 400
    
    result = health_assistant_pipeline(data["text"])
    return jsonify(result)

@app.route("/ocr", methods=["POST"])
def ocr():
    """
    Upload medical report (PDF or image) for OCR and analysis
    """
    # Check if file is present in request
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({
            "error": "Invalid file type. Allowed types: PDF, PNG, JPG, JPEG"
        }), 400
    
    try:
        # Read file bytes
        file_bytes = file.read()
        
        # Determine file type
        filename = secure_filename(file.filename)
        file_ext = filename.rsplit('.', 1)[1].lower()
        
        if file_ext == 'pdf':
            file_type = 'pdf'
        else:
            file_type = 'image'
        
        # Process the medical report
        result = process_medical_report(file_bytes, file_type)
        
        if "error" in result:
            return jsonify(result), 500
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"error": f"Processing failed: {str(e)}"}), 500

@app.route("/ask-report", methods=["POST"])
def ask_report():
    """
    Ask specific questions about an already processed report
    """
    data = request.json
    
    if not data or "report_data" not in data or "query" not in data:
        return jsonify({
            "error": "Send JSON with {'report_data': '...', 'query': 'your question'}"
        }), 400
    
    try:
        result = get_specific_insight(data["report_data"], data["query"])
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": f"Query failed: {str(e)}"}), 500

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Medical Report Analyzer API"}), 200

@app.errorhandler(413)
def too_large(e):
    return jsonify({"error": "File too large. Maximum size is 16MB"}), 413

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
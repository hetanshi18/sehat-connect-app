#ocr_processor.py
import google.generativeai as genai
from dotenv import load_dotenv
import os
import traceback
from PIL import Image
import io

load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("ERROR: GEMINI_API_KEY not found!")
    print("Add GEMINI_API_KEY=your_key to .env file")
else:
    genai.configure(api_key=GEMINI_API_KEY)

# Medical report analysis prompt
ANALYSIS_PROMPT = """
Analyze this medical/blood test report and provide a comprehensive analysis:

1. **Test Type**: Identify what kind of medical test this is

2. **Key Parameters**: List all test parameters with their values and reference ranges

3. **Abnormal Values**: Highlight any values outside normal range (mark as HIGH or LOW)

4. **Health Insights**: Provide interpretation of the results

5. **Recommendations**: Suggest follow-up actions or lifestyle changes

6. **Risk Assessment**: Identify any potential health concerns

Format clearly with sections and bullet points. Be medically accurate but easy to understand.
"""

def process_medical_report(file_bytes, file_type):
    """
    Process medical report (PDF or image) using Gemini
    """
    if not GEMINI_API_KEY:
        return {"error": "Gemini API key not configured"}
    
    try:
        print(f"Processing {file_type} file...")
        
        # Initialize model
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        if file_type == 'pdf':
            # For PDF, convert to images first
            try:
                import fitz  # PyMuPDF
                
                # Open PDF from bytes
                pdf_document = fitz.open(stream=file_bytes, filetype="pdf")
                
                # Convert first page to image (you can loop for multi-page)
                page = pdf_document[0]
                pix = page.get_pixmap(dpi=300)
                img_bytes = pix.tobytes("png")
                
                # Convert to PIL Image
                image = Image.open(io.BytesIO(img_bytes))
                pdf_document.close()
                
            except ImportError:
                return {
                    "error": "PyMuPDF not installed. Run: pip install PyMuPDF",
                    "fallback": "Please upload as an image (JPG/PNG) instead"
                }
        else:
            # For images, directly use PIL
            image = Image.open(io.BytesIO(file_bytes))
        
        print(f"Sending to Gemini for analysis...")
        
        # Generate content with image
        response = model.generate_content([ANALYSIS_PROMPT, image])
        
        print("✅ Analysis complete!")
        
        return {
            "success": True,
            "analysis": response.text,
            "file_type": file_type
        }
        
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"❌ Error:\n{error_trace}")
        return {
            "error": f"Processing failed: {str(e)}",
            "details": error_trace
        }

def get_specific_insight(report_data, query):
    """
    Ask specific questions about the report
    """
    if not GEMINI_API_KEY:
        return {"error": "Gemini API key not configured"}
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        Based on this medical report:
        {report_data}
        
        Question: {query}
        
        Provide a clear, medically accurate answer.
        """
        
        response = model.generate_content(prompt)
        
        return {
            "success": True,
            "answer": response.text
        }
        
    except Exception as e:
        return {"error": f"Query failed: {str(e)}"}
import base64
from google import genai
from dotenv import load_dotenv
import os
from PIL import Image
import io
import PyPDF2

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def process_medical_report(file_bytes, file_type):
    """
    Process medical report (PDF or image) and extract insights using Gemini
    
    Args:
        file_bytes: File content in bytes
        file_type: 'pdf' or 'image'
    
    Returns:
        dict: Extracted insights and analysis
    """
    try:
        if file_type == 'pdf':
            return process_pdf_report(file_bytes)
        elif file_type == 'image':
            return process_image_report(file_bytes)
        else:
            return {"error": "Unsupported file type"}
    except Exception as e:
        return {"error": f"Processing failed: {str(e)}"}

def process_image_report(image_bytes):
    """Process image-based medical report"""
    try:
        # Convert bytes to base64 for Gemini
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Save to bytes buffer
        buffer = io.BytesIO()
        image.save(buffer, format='JPEG')
        img_data = buffer.getvalue()
        
        # Create prompt for medical report analysis
        prompt = """
        Analyze this medical/blood test report image and provide:
        
        1. **Test Type**: Identify what kind of medical test this is
        2. **Key Parameters**: List all test parameters with their values and reference ranges
        3. **Abnormal Values**: Highlight any values outside normal range (mark as HIGH or LOW)
        4. **Health Insights**: Provide interpretation of the results
        5. **Recommendations**: Suggest any follow-up actions or lifestyle changes
        6. **Risk Assessment**: Identify any potential health concerns
        
        Format the response clearly with sections and bullet points.
        Be specific and medically accurate but use language that's easy to understand.
        """
        
        # Upload the image and get response
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=[
                prompt,
                {"mime_type": "image/jpeg", "data": img_data}
            ]
        )
        
        return {
            "success": True,
            "analysis": response.text,
            "file_type": "image"
        }
        
    except Exception as e:
        return {"error": f"Image processing failed: {str(e)}"}

def process_pdf_report(pdf_bytes):
    """Process PDF-based medical report"""
    try:
        # Extract text from PDF
        pdf_file = io.BytesIO(pdf_bytes)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        # Extract text from all pages
        full_text = ""
        for page in pdf_reader.pages:
            full_text += page.extract_text() + "\n"
        
        # If PDF has images, we can also extract them (optional enhancement)
        # For now, we'll work with text
        
        if not full_text.strip():
            return {"error": "Could not extract text from PDF. The file might be image-based."}
        
        # Create prompt for medical report analysis
        prompt = f"""
        Analyze this medical/blood test report and provide:
        
        1. **Test Type**: Identify what kind of medical test this is
        2. **Key Parameters**: List all test parameters with their values and reference ranges
        3. **Abnormal Values**: Highlight any values outside normal range (mark as HIGH or LOW)
        4. **Health Insights**: Provide interpretation of the results
        5. **Recommendations**: Suggest any follow-up actions or lifestyle changes
        6. **Risk Assessment**: Identify any potential health concerns
        
        Format the response clearly with sections and bullet points.
        Be specific and medically accurate but use language that's easy to understand.
        
        MEDICAL REPORT CONTENT:
        {full_text}
        """
        
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=prompt
        )
        
        return {
            "success": True,
            "analysis": response.text,
            "extracted_text": full_text[:500] + "..." if len(full_text) > 500 else full_text,
            "file_type": "pdf"
        }
        
    except Exception as e:
        return {"error": f"PDF processing failed: {str(e)}"}

def get_specific_insight(report_data, query):
    """
    Get specific insights from already processed report
    
    Args:
        report_data: Previously extracted report data
        query: Specific question about the report
    """
    try:
        prompt = f"""
        Based on this medical report data:
        {report_data}
        
        Answer this specific question:
        {query}
        
        Provide a clear, concise, and medically accurate answer.
        """
        
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=prompt
        )
        
        return {
            "success": True,
            "answer": response.text
        }
        
    except Exception as e:
        return {"error": f"Query processing failed: {str(e)}"}
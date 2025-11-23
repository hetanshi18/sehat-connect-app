import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function downloadPrescriptionAsPDF(prescriptionId: string, patientName: string) {
  try {
    // Fetch the HTML content
    const response = await fetch(
      `https://qwsfjkaylxykyxaynsgq.supabase.co/functions/v1/view-prescription?id=${prescriptionId}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch prescription');
    }
    
    const html = await response.text();
    
    // Create a temporary container to render the HTML
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '794px'; // A4 width in pixels at 96 DPI
    document.body.appendChild(container);
    
    // Wait a bit for styles to apply
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    // Remove temporary container
    document.body.removeChild(container);
    
    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Download the PDF
    const fileName = `prescription_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

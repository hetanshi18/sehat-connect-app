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
    container.style.width = '750px'; // Adjusted width for better fit
    container.style.padding = '0';
    container.style.margin = '0';
    document.body.appendChild(container);
    
    // Wait for images and styles to load
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 750,
      windowWidth: 750
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
    
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Download the PDF
    const fileName = `prescription_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

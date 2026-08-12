function generatePDF() {
  var pdfContent = document.getElementById('pdf-content');
  if (!pdfContent) {
    alert('Error: Could not generate PDF.');
    return;
  }

  // Get supplier and factory names for filename
  var supplierText = document.getElementById('pdf-supplier').textContent || 'Supplier';
  var factoryText = document.getElementById('pdf-factory').textContent || 'Factory';

  // Clean names for filename (remove special characters)
  var cleanSupplier = supplierText.replace(/[^a-zA-Z0-9]/g, '-');
  var cleanFactory = factoryText.replace(/[^a-zA-Z0-9]/g, '-');
  var filename = 'Quotation-' + cleanSupplier + '-' + cleanFactory + '.pdf';

  // Temporarily show the PDF content for rendering
  pdfContent.style.display = 'block';
  pdfContent.style.position = 'fixed';
  pdfContent.style.left = '-9999px';

  var opt = {
    margin: 0,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(pdfContent).save().then(function() {
    // Hide the PDF content again after generation
    pdfContent.style.display = 'none';
    pdfContent.style.position = '';
    pdfContent.style.left = '';
  }).catch(function(err) {
    console.error('PDF generation failed:', err);
    alert('Failed to generate PDF. Please try again.');
    pdfContent.style.display = 'none';
    pdfContent.style.position = '';
    pdfContent.style.left = '';
  });
}

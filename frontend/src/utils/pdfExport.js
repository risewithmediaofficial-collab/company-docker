import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Export element to PDF
 * @param {HTMLElement} element - Element to export
 * @param {string} filename - Name of the PDF file
 * @param {object} options - Additional options
 */
export const exportElementToPDF = async (element, filename = 'document.pdf', options = {}) => {
  try {
    const {
      orientation = 'portrait',
      format = 'a4',
      quality = 0.95,
    } = options;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20; // 10mm margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let yPosition = 10;

    if (imgHeight > pdfHeight - 20) {
      let heightLeft = imgHeight;
      let page = 1;

      while (heightLeft > 0) {
        const pageHeight = page === 1 ? pdfHeight - 20 : pdfHeight - 10;
        pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);

        heightLeft -= pageHeight;
        yPosition = heightLeft > 0 ? -imgHeight + pageHeight - 10 : 0;

        if (heightLeft > 0) {
          pdf.addPage();
          page += 1;
        }
      }
    } else {
      pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export PDF');
  }
};

/**
 * Export table/data as CSV then to PDF
 * @param {array} data - Array of objects
 * @param {array} columns - Column definitions
 * @param {string} filename - Name of the PDF file
 */
export const exportDataToPDF = (data, columns, filename = 'report.pdf') => {
  try {
    const pdf = new jsPDF();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const marginLeft = 10;
    const marginTop = 10;
    let currentY = marginTop;

    // Add title
    pdf.setFontSize(16);
    pdf.text(filename.replace('.pdf', ''), marginLeft, currentY);
    currentY += 10;

    // Add table
    pdf.setFontSize(10);
    const columnWidth = (pageWidth - 2 * marginLeft) / columns.length;

    // Header
    pdf.setFillColor(41, 128, 185);
    pdf.setTextColor(255, 255, 255);
    columns.forEach((col, index) => {
      pdf.rect(marginLeft + index * columnWidth, currentY, columnWidth, 7, 'F');
      pdf.text(col.label, marginLeft + index * columnWidth + 2, currentY + 5);
    });
    currentY += 7;

    // Body
    pdf.setTextColor(0, 0, 0);
    data.forEach((row) => {
      if (currentY > pageHeight - 10) {
        pdf.addPage();
        currentY = marginTop;
      }

      columns.forEach((col, index) => {
        const cellValue = String(row[col.key] || '').substring(0, 20);
        pdf.text(cellValue, marginLeft + index * columnWidth + 2, currentY + 5);
      });
      currentY += 7;
    });

    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting data to PDF:', error);
    throw new Error('Failed to export PDF');
  }
};

/**
 * Export CSV file
 * @param {array} data - Array of objects
 * @param {string} filename - Name of the CSV file
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

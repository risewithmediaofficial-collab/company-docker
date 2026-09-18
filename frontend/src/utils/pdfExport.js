import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '../api';

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

const formatProposalDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-IN');
};

const safeFilePart = (value) => String(value || 'proposal')
  .trim()
  .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
  .replace(/\s+/g, '-')
  .toLowerCase();

export const exportProposalToPDF = ({ project = {}, client = {} }) => {
  const proposalText = String(project.proposalText || '').trim();
  if (!proposalText) {
    throw new Error('No proposal text found');
  }

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (heightNeeded = 8) => {
    if (y + heightNeeded <= pageHeight - margin) return;
    pdf.addPage();
    y = margin;
  };

  pdf.setFontSize(20);
  pdf.setTextColor(28, 37, 54);
  pdf.text('Project Proposal', margin, y);
  y += 10;

  pdf.setFontSize(10);
  pdf.setTextColor(107, 114, 128);
  pdf.text(`Generated on ${new Date().toLocaleString('en-IN')}`, margin, y);
  y += 10;

  pdf.setDrawColor(226, 232, 240);
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(margin, y, contentWidth, 38, 3, 3, 'FD');

  pdf.setFontSize(11);
  pdf.setTextColor(15, 23, 42);
  const projectDetails = [
    ['Client', client.name || client.company || 'N/A'],
    ['Project', project.name || 'N/A'],
    ['Status', project.status || 'N/A'],
    ['Category', project.category || 'N/A'],
    ['Start Date', formatProposalDate(project.startDate)],
    ['Due Date', formatProposalDate(project.dueDate)],
  ];

  let detailsY = y + 8;
  projectDetails.forEach(([label, value], index) => {
    const columnX = index % 2 === 0 ? margin + 4 : margin + contentWidth / 2;
    if (index % 2 === 0 && index > 0) detailsY += 9;
    pdf.setFont(undefined, 'bold');
    pdf.text(`${label}:`, columnX, detailsY);
    pdf.setFont(undefined, 'normal');
    pdf.text(String(value), columnX + 24, detailsY);
  });

  y += 48;

  if (project.description) {
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(12);
    pdf.text('Project Summary', margin, y);
    y += 7;
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(11);
    const summaryLines = pdf.splitTextToSize(String(project.description), contentWidth);
    summaryLines.forEach((line) => {
      ensureSpace(6);
      pdf.text(line, margin, y);
      y += 5.5;
    });
    y += 4;
  }

  ensureSpace(12);
  pdf.setFont(undefined, 'bold');
  pdf.setFontSize(12);
  pdf.text('Proposal', margin, y);
  y += 7;

  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(11);
  const proposalLines = pdf.splitTextToSize(proposalText, contentWidth);
  proposalLines.forEach((line) => {
    ensureSpace(6);
    pdf.text(line, margin, y);
    y += 5.5;
  });

  const filename = `${safeFilePart(client.name || client.company || 'client')}-${safeFilePart(project.name || 'project')}-proposal.pdf`;
  pdf.save(filename);
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

const formatCurrencyINR = (amount) => {
  const val = Number(amount || 0);
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
  return `Rs. ${formatted}`;
};

const getCompanyProfileForInvoice = async () => {
  try {
    const response = await api.get('/settings');
    const profile = response?.data?.settings?.companyProfile || {};
    return {
      name: profile.name || 'RISE WITH MEDIA',
      address: profile.address || '',
      email: profile.email || '',
      phone: profile.phone || '',
      gstNumber: profile.gstNumber || '',
      services: profile.services || 'Media & Marketing Operations Platform',
      logoUrl: profile.logoUrl || '/branding/rise-with-media-logo.png',
    };
  } catch {
    return {
      name: 'RISE WITH MEDIA',
      address: '',
      email: '',
      phone: '',
      gstNumber: '',
      services: 'Media & Marketing Operations Platform',
      logoUrl: '/branding/rise-with-media-logo.png',
    };
  }
};

const loadLogoImage = async (logoUrl) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const defaultAssetLogo = `${origin}/branding/rise-with-media-logo.png`;
  const targetUrl = logoUrl
    ? (logoUrl.startsWith('http') ? logoUrl : `${origin}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl}`)
    : defaultAssetLogo;

  try {
    let response = await fetch(targetUrl, { mode: 'cors' });
    if (!response.ok && targetUrl !== defaultAssetLogo) {
      response = await fetch(defaultAssetLogo);
    }
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

/**
 * Export Invoice to PDF
 * @param {object} invoice - Invoice data object
 * @param {object} options - Options (save: boolean, filename: string)
 */
export const exportInvoiceToPDF = async (invoice, options = {}) => {
  const { save = true } = options;
  const companyProfile = await getCompanyProfileForInvoice();
  const logoDataUrl = await loadLogoImage(companyProfile.logoUrl);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (needed = 10) => {
    if (y + needed > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  // Header Banner / Logo
  pdf.setFillColor(15, 23, 42); // slate-900 header
  pdf.rect(0, 0, pageWidth, 28, 'F');

  if (logoDataUrl) {
    try {
      pdf.addImage(logoDataUrl, 'PNG', margin, 7, 26, 14);
    } catch {
      // Ignore logo render issues and fall back to text branding
    }
  }

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(255, 255, 255);
  const companyTitleX = logoDataUrl ? margin + 32 : margin;
  pdf.text(companyProfile.name || 'RISE WITH MEDIA', companyTitleX, 14);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(203, 213, 225);
  const companyTagline = companyProfile.services || 'Media & Marketing Operations Platform';
  pdf.text(companyTagline, companyTitleX, 20);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(255, 255, 255);
  pdf.text('INVOICE', pageWidth - margin, 15, { align: 'right' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text(invoice.invoiceNumber || 'INV-DRAFT', pageWidth - margin, 21, { align: 'right' });

  y = 35;

  // Invoice & Client Info Card
  pdf.setDrawColor(226, 232, 240);
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(margin, y, contentWidth, 36, 3, 3, 'FD');

  const clientName = invoice.clientDetails?.businessName || invoice.clientDetails?.name || invoice.client?.company || invoice.client?.name || invoice.clientName || 'Client';
  const clientEmail = invoice.clientDetails?.email || invoice.client?.email || '';
  const clientPhone = invoice.clientDetails?.phone || invoice.client?.phone || '';
  const projectName = invoice.projectName || invoice.project?.name || 'General Services';

  const issueDateStr = invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
  const dueDateStr = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN') : 'N/A';
  const statusStr = (invoice.status || invoice.invoiceStatus || 'Draft').toUpperCase();

  // Left Column - Bill To
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(15, 23, 42);
  pdf.text('Billed To:', margin + 4, y + 8);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(30, 41, 59);
  pdf.text(String(clientName), margin + 4, y + 15);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(100, 116, 139);
  let clientInfoY = y + 21;
  if (projectName) {
    pdf.text(`Project: ${projectName}`, margin + 4, clientInfoY);
    clientInfoY += 5;
  }
  if (clientEmail || clientPhone) {
    pdf.text([clientEmail, clientPhone].filter(Boolean).join(' | '), margin + 4, clientInfoY);
  }

  // Right Column - Invoice Meta
  const rightX = margin + contentWidth / 2 + 10;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(71, 85, 105);

  pdf.text('Invoice Date:', rightX, y + 8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(15, 23, 42);
  pdf.text(issueDateStr, rightX + 28, y + 8);

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(71, 85, 105);
  pdf.text('Due Date:', rightX, y + 15);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(15, 23, 42);
  pdf.text(dueDateStr, rightX + 28, y + 15);

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(71, 85, 105);
  pdf.text('Status:', rightX, y + 22);
  pdf.setFont('helvetica', 'bold');
  if (statusStr === 'PAID') pdf.setTextColor(22, 163, 74);
  else if (statusStr === 'OVERDUE') pdf.setTextColor(220, 38, 38);
  else pdf.setTextColor(37, 99, 235);
  pdf.text(statusStr, rightX + 28, y + 22);

  y += 44;

  // Table Headers
  const colX = {
    sno: margin + 2,
    service: margin + 12,
    qty: margin + 105,
    rate: margin + 130,
    amount: pageWidth - margin - 2,
  };

  pdf.setFillColor(241, 245, 249);
  pdf.rect(margin, y, contentWidth, 8, 'F');
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, y + 8, pageWidth - margin, y + 8);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(51, 65, 85);
  pdf.text('#', colX.sno, y + 5.5);
  pdf.text('Service / Description', colX.service, y + 5.5);
  pdf.text('Qty', colX.qty, y + 5.5, { align: 'center' });
  pdf.text('Rate (Rs.)', colX.rate, y + 5.5, { align: 'right' });
  pdf.text('Amount (Rs.)', colX.amount, y + 5.5, { align: 'right' });

  y += 10;

  // Table Items
  const items = invoice.invoiceItems || invoice.lineItems || [
    {
      serviceName: 'Services Provided',
      description: invoice.description || invoice.serviceDetails || '',
      quantity: 1,
      rate: Number(invoice.totalAmount || invoice.total || invoice.amount || 0),
      amount: Number(invoice.totalAmount || invoice.total || invoice.amount || 0),
    },
  ];

  let rawSubtotal = 0;

  items.forEach((item, index) => {
    ensureSpace(12);
    const qty = Number(item.quantity || 1);
    const rate = Number(item.rate ?? item.unitPrice ?? 0);
    const itemAmount = Number(item.amount ?? (qty * rate));
    rawSubtotal += itemAmount;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(30, 41, 59);

    pdf.text(String(index + 1), colX.sno, y);

    const serviceTitle = item.serviceName || 'Service';
    pdf.setFont('helvetica', 'bold');
    pdf.text(serviceTitle, colX.service, y);
    pdf.setFont('helvetica', 'normal');

    let itemY = y;
    if (item.description) {
      itemY += 4.5;
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      const descLines = pdf.splitTextToSize(item.description, 90);
      descLines.forEach((dLine) => {
        pdf.text(dLine, colX.service, itemY);
        itemY += 4;
      });
    }

    pdf.setFontSize(9);
    pdf.setTextColor(30, 41, 59);
    pdf.text(String(qty), colX.qty, y, { align: 'center' });
    pdf.text(rate.toLocaleString('en-IN', { minimumFractionDigits: 2 }), colX.rate, y, { align: 'right' });
    pdf.text(itemAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }), colX.amount, y, { align: 'right' });

    y = Math.max(itemY + 4, y + 8);
    pdf.setDrawColor(241, 245, 249);
    pdf.line(margin, y - 2, pageWidth - margin, y - 2);
  });

  y += 4;
  ensureSpace(45);

  // Financial Calculations
  const discount = Number(invoice.discount || 0);
  const taxRate = Number(invoice.taxRate || 0);
  const subtotalAfterDiscount = Math.max(rawSubtotal - discount, 0);
  const taxAmount = taxRate > 0 ? (subtotalAfterDiscount * taxRate) / 100 : 0;
  const grandTotal = Number(invoice.totalAmount || invoice.total || (subtotalAfterDiscount + taxAmount));
  const paidAmount = Number(invoice.paidAmount || 0);
  const balanceAmount = Number(invoice.balanceAmount ?? Math.max(grandTotal - paidAmount, 0));

  // Bottom Summary Grid
  const summaryWidth = 92;
  const summaryX = pageWidth - margin - summaryWidth;

  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(summaryX, y, summaryWidth, taxRate > 0 || discount > 0 ? 46 : 34, 2, 2, 'FD');

  let sumY = y + 7;
  pdf.setFontSize(9);

  if (discount > 0 || taxRate > 0) {
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    pdf.text('Subtotal:', summaryX + 4, sumY);
    pdf.text(formatCurrencyINR(rawSubtotal), summaryX + summaryWidth - 4, sumY, { align: 'right' });
    sumY += 6;

    if (discount > 0) {
      pdf.text('Discount:', summaryX + 4, sumY);
      pdf.text(`- ${formatCurrencyINR(discount)}`, summaryX + summaryWidth - 4, sumY, { align: 'right' });
      sumY += 6;
    }

    if (taxRate > 0) {
      pdf.text(`Tax / GST (${taxRate}%):`, summaryX + 4, sumY);
      pdf.text(formatCurrencyINR(taxAmount), summaryX + summaryWidth - 4, sumY, { align: 'right' });
      sumY += 6;
    }
  }

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text('Total Amount:', summaryX + 4, sumY);
  pdf.text(formatCurrencyINR(grandTotal), summaryX + summaryWidth - 4, sumY, { align: 'right' });
  sumY += 6;

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(22, 163, 74);
  pdf.text('Paid Amount:', summaryX + 4, sumY);
  pdf.text(formatCurrencyINR(paidAmount), summaryX + summaryWidth - 4, sumY, { align: 'right' });
  sumY += 6;

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(220, 38, 38);
  pdf.text('Balance Due:', summaryX + 4, sumY);
  pdf.text(formatCurrencyINR(balanceAmount), summaryX + summaryWidth - 4, sumY, { align: 'right' });

  // Notes & Payment Instructions (Left Side)
  const leftWidth = contentWidth - summaryWidth - 6;
  let notesY = y + 4;

  if (invoice.paymentLink) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(37, 99, 235);
    pdf.text('Payment Link:', margin, notesY);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.text(String(invoice.paymentLink), margin, notesY + 5);
    notesY += 12;
  }

  if (invoice.paymentTerms || invoice.terms) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(15, 23, 42);
    pdf.text('Payment Instructions / Terms:', margin, notesY);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(71, 85, 105);
    const termsLines = pdf.splitTextToSize(String(invoice.paymentTerms || invoice.terms), leftWidth);
    notesY += 5;
    termsLines.forEach((tLine) => {
      pdf.text(tLine, margin, notesY);
      notesY += 4;
    });
    notesY += 2;
  }

  if (invoice.notes) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(15, 23, 42);
    pdf.text('Notes:', margin, notesY);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(71, 85, 105);
    const notesLines = pdf.splitTextToSize(String(invoice.notes), leftWidth);
    notesY += 5;
    notesLines.forEach((nLine) => {
      pdf.text(nLine, margin, notesY);
      notesY += 4;
    });
  }

  // Footer
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(148, 163, 184);
  pdf.text('Thank you for working with Rise With Media. For support, contact finance@risewithmedia.com', margin, pageHeight - 8);
  pdf.text('Page 1 of 1', pageWidth - margin, pageHeight - 8, { align: 'right' });

  const fileName = `${(invoice.invoiceNumber || 'invoice').toLowerCase().replace(/[^a-z0-9_-]/gi, '_')}.pdf`;
  if (save) {
    pdf.save(fileName);
  }
  return { pdf, fileName };
};

/**
 * Export a single company registration request / SaaS tenant dossier as PDF
 * @param {object} org - Organization object with populated ownerId
 */
export const exportCompanyDetailsToPDF = (org) => {
  if (!org) return;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (needed = 10) => {
    if (y + needed > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  // Header branding bar
  pdf.setFillColor(79, 70, 229); // Indigo 600
  pdf.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(255, 255, 255);
  pdf.text('RISEWITHMEDIA AGENCY OS', margin + 6, y + 9);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(224, 231, 255);
  pdf.text('SaaS Tenant Onboarding & Company Registration Dossier', margin + 6, y + 16);

  // Status chip on top right of header
  const statusUpper = (org.planStatus || 'pending').toUpperCase();
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setFillColor(255, 255, 255);
  pdf.setTextColor(79, 70, 229);
  pdf.roundedRect(pageWidth - margin - 32, y + 6, 26, 7, 2, 2, 'F');
  pdf.text(statusUpper, pageWidth - margin - 19, y + 10.8, { align: 'center' });

  y += 30;

  // Metadata bar
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`Tenant ID: ${org._id || 'N/A'}`, margin, y);
  pdf.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageWidth - margin, y, { align: 'right' });
  y += 5;

  // Divider
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Box 1: Company Profile
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(203, 213, 225);
  pdf.roundedRect(margin, y, contentWidth, 34, 2.5, 2.5, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10.5);
  pdf.setTextColor(30, 41, 59);
  pdf.text('COMPANY PROFILE', margin + 5, y + 7);

  pdf.setFontSize(9);
  const col1X = margin + 5;
  const col2X = margin + contentWidth / 2 + 5;

  // Row 1
  pdf.setFont('helvetica', 'bold');
  pdf.text('Company Name:', col1X, y + 14);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${org.name || 'N/A'} + RWM`, col1X + 32, y + 14);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Industry:', col2X, y + 14);
  pdf.setFont('helvetica', 'normal');
  pdf.text(String(org.industry || 'General Business'), col2X + 22, y + 14);

  // Row 2
  pdf.setFont('helvetica', 'bold');
  pdf.text('Website:', col1X, y + 21);
  pdf.setFont('helvetica', 'normal');
  pdf.text(String(org.website || 'None'), col1X + 32, y + 21);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Registration Date:', col2X, y + 21);
  pdf.setFont('helvetica', 'normal');
  pdf.text(new Date(org.createdAt).toLocaleString('en-IN'), col2X + 32, y + 21);

  // Row 3
  pdf.setFont('helvetica', 'bold');
  pdf.text('Phone:', col1X, y + 28);
  pdf.setFont('helvetica', 'normal');
  pdf.text(String(org.phone || org.ownerId?.phone || 'Not provided'), col1X + 32, y + 28);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Address:', col2X, y + 28);
  pdf.setFont('helvetica', 'normal');
  pdf.text(String(org.address || 'Not provided'), col2X + 22, y + 28);

  y += 40;

  // Box 2: Owner Information
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(203, 213, 225);
  pdf.roundedRect(margin, y, contentWidth, 27, 2.5, 2.5, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10.5);
  pdf.setTextColor(30, 41, 59);
  pdf.text('ACCOUNT OWNER DETAILS', margin + 5, y + 7);

  pdf.setFontSize(9);
  // Row 1
  pdf.setFont('helvetica', 'bold');
  pdf.text('Owner Name:', col1X, y + 14);
  pdf.setFont('helvetica', 'normal');
  pdf.text(String(org.ownerId?.name || 'Pending Review'), col1X + 32, y + 14);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Email Address:', col2X, y + 14);
  pdf.setFont('helvetica', 'normal');
  pdf.text(String(org.ownerId?.email || 'N/A'), col2X + 28, y + 14);

  // Row 2
  pdf.setFont('helvetica', 'bold');
  pdf.text('System Role:', col1X, y + 21);
  pdf.setFont('helvetica', 'normal');
  pdf.text('organizationOwner', col1X + 32, y + 21);

  pdf.setFont('helvetica', 'bold');
  pdf.text('User Status:', col2X, y + 21);
  pdf.setFont('helvetica', 'normal');
  pdf.text(org.planStatus === 'active' ? 'Approved & Active' : 'Pending Verification', col2X + 28, y + 21);

  y += 33;

  // Box 3: SaaS Subscription & Limits
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(203, 213, 225);
  pdf.roundedRect(margin, y, contentWidth, 27, 2.5, 2.5, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10.5);
  pdf.setTextColor(30, 41, 59);
  pdf.text('SUBSCRIPTION & CAPACITY LIMITS', margin + 5, y + 7);

  pdf.setFontSize(9);
  // Row 1
  pdf.setFont('helvetica', 'bold');
  pdf.text('Plan Tier:', col1X, y + 14);
  pdf.setFont('helvetica', 'normal');
  pdf.text(String(org.plan || 'trial').toUpperCase(), col1X + 32, y + 14);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Trial Ends At:', col2X, y + 14);
  pdf.setFont('helvetica', 'normal');
  pdf.text(org.trialEndsAt ? new Date(org.trialEndsAt).toLocaleDateString('en-IN') : '14 Days Standard', col2X + 28, y + 14);

  // Row 2
  pdf.setFont('helvetica', 'bold');
  pdf.text('Max Users:', col1X, y + 21);
  pdf.setFont('helvetica', 'normal');
  pdf.text(String(org.maxUsers || 3), col1X + 32, y + 21);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Max Clients:', col2X, y + 21);
  pdf.setFont('helvetica', 'normal');
  pdf.text(String(org.maxClients || 5), col2X + 28, y + 21);

  y += 33;

  // Box 4: Enabled Application Modules
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10.5);
  pdf.setTextColor(30, 41, 59);
  pdf.text('MODULE CONFIGURATION PRIVILEGES', margin, y);
  y += 4;

  const modulesList = [
    { key: 'crm', label: 'CRM & Leads' },
    { key: 'clients', label: 'Clients' },
    { key: 'projects', label: 'Projects' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'finance', label: 'Finance & Invoicing' },
    { key: 'hr', label: 'HR & Hiring' },
    { key: 'attendance', label: 'Attendance & EOD' },
    { key: 'proposals', label: 'Proposals' },
    { key: 'portal', label: 'Client Portal' },
    { key: 'reports', label: 'Reports & Analytics' },
    { key: 'sop', label: 'SOP Library' },
    { key: 'assets', label: 'Asset Library' },
    { key: 'smm', label: 'SMM Module' },
    { key: 'automations', label: 'Automations' },
    { key: 'influencers', label: 'Influencer Hub' },
    { key: 'ai', label: 'AI Features' },
  ];

  const modWidth = (contentWidth - 6) / 3;
  let modY = y;
  modulesList.forEach((m, idx) => {
    const colIndex = idx % 3;
    if (colIndex === 0 && idx > 0) modY += 7;
    const modX = margin + colIndex * (modWidth + 3);
    const isEnabled = Boolean(org.enabledModules?.[m.key]);

    pdf.setFillColor(isEnabled ? 236 : 241, isEnabled ? 253 : 245, isEnabled ? 245 : 249);
    pdf.setDrawColor(isEnabled ? 167 : 226, isEnabled ? 243 : 232, isEnabled ? 208 : 240);
    pdf.roundedRect(modX, modY, modWidth, 6, 1.5, 1.5, 'FD');

    pdf.setFont('helvetica', isEnabled ? 'bold' : 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(isEnabled ? 16 : 100, isEnabled ? 122 : 116, isEnabled ? 87 : 139);
    pdf.text(isEnabled ? `[x] ${m.label}` : `[ ] ${m.label}`, modX + 2.5, modY + 4.2);
  });

  y = modY + 12;

  // Box 5: Admin Notes & Approval History
  if (org.adminNotes || org.approvedAt || org.suspendReason) {
    ensureSpace(20);
    pdf.setFillColor(254, 243, 199);
    pdf.setDrawColor(251, 191, 36);
    pdf.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(146, 64, 14);
    pdf.text('SUPER ADMIN RECORD & NOTES:', margin + 4, y + 6);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    let noteText = org.adminNotes || 'No special admin notes.';
    if (org.suspendReason) noteText += ` | Suspended Reason: ${org.suspendReason}`;
    if (org.approvedAt) noteText += ` | Approved on: ${new Date(org.approvedAt).toLocaleDateString('en-IN')}`;

    pdf.text(pdf.splitTextToSize(noteText, contentWidth - 8), margin + 4, y + 12);
    y += 24;
  }

  // Footer
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(148, 163, 184);
  pdf.text('RiseWithMedia Agency OS Platform Administration — Confidential & Proprietary Document', margin, pageHeight - 8);
  pdf.text(`Page 1 of 1`, pageWidth - margin, pageHeight - 8, { align: 'right' });

  // Clean filename
  const cleanName = String(org.name || 'company')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  pdf.save(`${cleanName}-registration-dossier.pdf`);
};

/**
 * Export all company registration requests as a structured PDF summary report
 * @param {array} orgs - Array of organization objects
 * @param {string} activeFilter - Current active filter name
 */
export const exportCompanyListToPDF = (orgs = [], activeFilter = 'all') => {
  if (!orgs || orgs.length === 0) {
    throw new Error('No company records to export');
  }

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header Banner
  pdf.setFillColor(79, 70, 229);
  pdf.roundedRect(margin, y, contentWidth, 18, 2.5, 2.5, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(255, 255, 255);
  pdf.text('RISEWITHMEDIA AGENCY OS — COMPANY REGISTRATIONS REPORT', margin + 6, y + 8);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(224, 231, 255);
  pdf.text(`Filter: ${activeFilter.toUpperCase()}  |  Total Records: ${orgs.length}  |  Generated on ${new Date().toLocaleString('en-IN')}`, margin + 6, y + 14);

  y += 24;

  // Table Columns
  const cols = [
    { label: '#', width: 10 },
    { label: 'Company Name', width: 55 },
    { label: 'Industry', width: 35 },
    { label: 'Owner Name', width: 45 },
    { label: 'Email / Contact', width: 55 },
    { label: 'Plan', width: 22 },
    { label: 'Status', width: 25 },
    { label: 'Registered', width: 26 },
  ];

  // Table Header
  pdf.setFillColor(241, 245, 249);
  pdf.setDrawColor(203, 213, 225);
  pdf.rect(margin, y, contentWidth, 7, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(30, 41, 59);

  let currentX = margin;
  cols.forEach((col) => {
    pdf.text(col.label, currentX + 2, y + 4.8);
    currentX += col.width;
  });

  y += 7;

  // Rows
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);

  orgs.forEach((o, index) => {
    if (y + 8 > pageHeight - margin) {
      pdf.addPage();
      y = margin;

      // Repeat Table Header
      pdf.setFillColor(241, 245, 249);
      pdf.setDrawColor(203, 213, 225);
      pdf.rect(margin, y, contentWidth, 7, 'FD');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(30, 41, 59);

      let repX = margin;
      cols.forEach((col) => {
        pdf.text(col.label, repX + 2, y + 4.8);
        repX += col.width;
      });
      y += 7;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
    }

    const isEven = index % 2 === 0;
    if (isEven) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin, y, contentWidth, 7, 'F');
    }

    pdf.setDrawColor(241, 245, 249);
    pdf.line(margin, y + 7, margin + contentWidth, y + 7);

    pdf.setTextColor(15, 23, 42);
    let rowX = margin;

    // #
    pdf.text(String(index + 1), rowX + 2, y + 4.8);
    rowX += cols[0].width;

    // Company Name
    pdf.setFont('helvetica', 'bold');
    pdf.text(String(`${o.name || 'N/A'} + RWM`).substring(0, 32), rowX + 2, y + 4.8);
    pdf.setFont('helvetica', 'normal');
    rowX += cols[1].width;

    // Industry
    pdf.text(String(o.industry || 'General').substring(0, 20), rowX + 2, y + 4.8);
    rowX += cols[2].width;

    // Owner Name
    pdf.text(String(o.ownerId?.name || 'N/A').substring(0, 25), rowX + 2, y + 4.8);
    rowX += cols[3].width;

    // Email
    pdf.text(String(o.ownerId?.email || 'N/A').substring(0, 32), rowX + 2, y + 4.8);
    rowX += cols[4].width;

    // Plan
    pdf.text(String(o.plan || 'trial').toUpperCase(), rowX + 2, y + 4.8);
    rowX += cols[5].width;

    // Status
    pdf.text(String(o.planStatus || 'pending'), rowX + 2, y + 4.8);
    rowX += cols[6].width;

    // Registered
    const regDate = new Date(o.createdAt).toLocaleDateString('en-IN');
    pdf.text(regDate, rowX + 2, y + 4.8);

    y += 7;
  });

  // Footer
  pdf.setFontSize(7);
  pdf.setTextColor(148, 163, 184);
  pdf.text(`RiseWithMedia Platform Admin — Report generated on ${new Date().toLocaleString()}`, margin, pageHeight - 6);

  pdf.save(`company-registrations-report-${new Date().toISOString().slice(0, 10)}.pdf`);
};

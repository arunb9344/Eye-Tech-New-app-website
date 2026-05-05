import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LOGO_BASE64 } from './LogoBase64';

const InvoiceGenerator = {
  generateInvoice: (booking) => {
    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      const pageWidth = 595;
      
      // Header Section
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, pageWidth, 150, 'F');

      // Actual Logo Mapping
      try {
        // Use the embedded base64 logo for reliability
        doc.addImage(LOGO_BASE64, 'PNG', 40, 35, 80, 80);
      } catch (e) {
        console.error("Logo Error:", e);
        // Fallback placeholder if image fails to load
        doc.setDrawColor(255, 255, 255);
        doc.rect(40, 35, 80, 80, 'D');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text('ET', 80, 85, { align: 'center' });
      }

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24); // Slightly reduced to avoid overlap
      doc.text('EYE TECH SECURITIES', 135, 60);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Door No:01, Shop No:02, 15th Nehru Street,', 135, 80);
      doc.text('Nanganallur, Chennai-600061', 135, 95);
      doc.text('Ph: 9962835944 | support@eyetechsecurities.in', 135, 115);

      // Invoice Labels (Move further right to avoid overlap)
      const invoiceType = (booking.type || 'Service').toUpperCase();
      const invoiceHeader = `${invoiceType} INVOICE`;
      
      let invoiceNoStr = booking.invoiceNumber || '';
      if (!invoiceNoStr) {
        const baseInvoiceNo = 250;
        const bookingYear = 26;
        const idDigits = String(booking.id || '').replace(/\D/g, '');
        const derivedNo = baseInvoiceNo + (parseInt(idDigits.slice(-3)) || 0);
        invoiceNoStr = `Eye/${bookingYear}-${bookingYear + 1}/${derivedNo}`;
      }

      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(invoiceHeader, 565, 60, { align: 'right' }); // Shifted to 565
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Inv #: ${invoiceNoStr}`, 565, 85, { align: 'right' });
      const dateToPrint = booking.invoiceDate ? new Date(booking.invoiceDate) : (booking.bookingDate ? new Date(booking.bookingDate) : new Date());
      doc.text(`Date: ${dateToPrint.toLocaleDateString('en-GB')}`, 565, 105, { align: 'right' });

      // Sections
      let currentY = 190;
      doc.setTextColor(128, 128, 128);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('BILL TO', 40, currentY);
      doc.text('BOOKING DETAILS', 400, currentY);

      currentY += 20;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text(booking.userName || 'Customer', 40, currentY);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Booking ID: ${String(booking.id || '').slice(-8).toUpperCase()}`, 400, currentY);

      currentY += 18;
      doc.text(booking.userPhone || 'N/A', 40, currentY);
      doc.text(`Type: ${booking.type || 'N/A'}`, 400, currentY);

      currentY += 18;
      const addrLines = doc.splitTextToSize(booking.fullAddress || '', 300);
      doc.text(addrLines, 40, currentY);
      doc.text(`Status: ${booking.status || 'N/A'}`, 400, currentY);

      currentY += Math.max(addrLines.length * 15, 36);
      doc.text(`Pincode: ${booking.pincode || ''}`, 40, currentY);
      doc.text(`Eye Tech Installed: ${booking.isEyeTechInstalled ? 'Yes' : 'No'}`, 400, currentY);

      // --- Table Section ---
      currentY = 320;
      autoTable(doc, {
        startY: currentY,
        head: [['DESCRIPTION', 'QTY', 'AMOUNT']],
        body: [[
          booking.type === 'Installation' 
            ? `CCTV Installation Service (${booking.numberOfCameras || 0} Cameras)` 
            : 'Security System Service Visit',
          '1',
          `Rs. ${booking.amountCharged || 0}`
        ]],
        theme: 'striped',
        headStyles: { fillColor: [241, 245, 249], textColor: [0, 0, 0] },
        styles: { fontSize: 11, cellPadding: 8 },
        columnStyles: {
          0: { cellWidth: 350 },
          1: { cellWidth: 50, halign: 'center' },
          2: { cellWidth: 115, halign: 'right' }
        },
        margin: { left: 40, right: 40 }
      });

      currentY = doc.lastAutoTable.finalY + 20;
      
      // Charge Type Note (Mirroring app's design: below descriptions)
      doc.setTextColor(128, 128, 128);
      doc.setFontSize(9);
      doc.text(`Type: ${booking.chargeType || 'Chargeable'}`, 50, currentY);
      
      currentY += 20;
      doc.setDrawColor(211, 211, 211);
      doc.line(40, currentY, 555, currentY);

      // Work Summary
      currentY += 25;
      doc.setTextColor(128, 128, 128);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('WORK SUMMARY / NOTES', 40, currentY);

      currentY += 20;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const workDesc = booking.completionDescription || booking.description || '';
      if (workDesc) {
        const workLines = doc.splitTextToSize(workDesc, 515);
        doc.text(workLines, 40, currentY);
        currentY += (workLines.length * 18);
      }

      // Checklist (AMC:Maintenance)
      if (booking.chargeType === 'AMC:Maintenance') {
        currentY += 20;
        doc.setTextColor(128, 128, 128);
        doc.text('MAINTENANCE CHECKLIST', 40, currentY);
        currentY += 20;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        if (booking.checkAllCamerasLive) { doc.text("- All Cameras Live", 50, currentY); currentY += 15; }
        if (booking.checkPlaybackWorking) { doc.text("- Playback Working", 50, currentY); currentY += 15; }
        if (booking.checkRecordingStorage) { doc.text("- Recording Storage Healthy", 50, currentY); currentY += 15; }
        if (booking.checkMobileViewWorking) { doc.text("- Mobile View Verified", 50, currentY); currentY += 15; }
      }

      // Totals
      currentY = Math.max(currentY + 20, 660);
      if (booking.isGstInvoice) {
        const total = booking.amountCharged || 0;
        const baseAmount = total / 1.18;
        const tax = (total - baseAmount) / 2;
        doc.setTextColor(128, 128, 128);
        doc.text('Taxable Amount:', 350, currentY);
        doc.setTextColor(0, 0, 0);
        doc.text(`Rs. ${baseAmount.toFixed(2)}`, 550, currentY, { align: 'right' });
        currentY += 15;
        doc.setTextColor(128, 128, 128);
        doc.text('CGST (9%):', 350, currentY);
        doc.setTextColor(0, 0, 0);
        doc.text(`Rs. ${tax.toFixed(2)}`, 550, currentY, { align: 'right' });
        currentY += 15;
        doc.setTextColor(128, 128, 128);
        doc.text('SGST (9%):', 350, currentY);
        doc.setTextColor(0, 0, 0);
        doc.text(`Rs. ${tax.toFixed(2)}`, 550, currentY, { align: 'right' });
        currentY += 20;
        if (booking.gstNumber) {
          doc.setFont('helvetica', 'bold');
          doc.text(`Customer GSTIN: ${booking.gstNumber}`, 40, currentY - 20);
        }
      }

      doc.setDrawColor(211, 211, 211);
      doc.line(350, currentY, 555, currentY);
      currentY += 30;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('TOTAL AMOUNT', 350, currentY);
      doc.text(`Rs. ${booking.amountCharged || 0}`, 550, currentY, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('THANK YOU FOR CHOOSING EYE TECH SECURITIES', 297, 815, { align: 'center' });

      doc.save(`Invoice_${String(booking.id || '').slice(-6).toUpperCase()}.pdf`);
    } catch (err) {
      alert("PDF Error: " + err.message);
    }
  },

  generateAmcInvoice: (amc) => {
    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      const pageWidth = 595;
      
      // Header Section
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, pageWidth, 150, 'F');

      try {
        doc.addImage(LOGO_BASE64, 'PNG', 40, 35, 80, 80);
      } catch (e) {
        console.error("AMC Logo Error:", e);
        doc.setDrawColor(255, 255, 255);
        doc.rect(40, 35, 80, 80, 'D');
      }

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.text('EYE TECH SECURITIES', 135, 60);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Door No:01, Shop No:02, 15th Nehru Street,', 135, 80);
      doc.text('Nanganallur, Chennai-600061', 135, 95);
      doc.text('Ph: 9962835944 | support@eyetechsecurities.in', 135, 115);

      // Invoice Labels
      const baseInvoiceNo = 100;
      const bookingYear = 26;
      const idDigits = String(amc.id || '').replace(/\D/g, '');
      const derivedNo = baseInvoiceNo + (parseInt(idDigits.slice(-3)) || 0);
      const invoiceNoStr = `Eye-AMC/${bookingYear}-${bookingYear + 1}/${derivedNo}`;

      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text("AMC INVOICE", 565, 60, { align: 'right' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Inv #: ${invoiceNoStr}`, 565, 85, { align: 'right' });
      const dateToPrint = amc.purchaseDate ? new Date(amc.purchaseDate) : new Date();
      doc.text(`Date: ${dateToPrint.toLocaleDateString('en-GB')}`, 565, 105, { align: 'right' });

      // Sections
      let currentY = 190;
      doc.setTextColor(128, 128, 128);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('BILL TO', 40, currentY);
      doc.text('AMC DETAILS', 400, currentY);

      currentY += 20;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text(amc.userName || 'Customer', 40, currentY);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Status: ${amc.status || 'N/A'}`, 400, currentY);

      currentY += 18;
      doc.text(amc.userPhone || 'N/A', 40, currentY);
      if (amc.validityUpto) {
        doc.text(`Valid Upto: ${new Date(amc.validityUpto).toLocaleDateString('en-GB')}`, 400, currentY);
      } else {
        doc.text(`Package: ${amc.packageName || 'N/A'}`, 400, currentY);
      }

      currentY += 18;
      const addrLines = doc.splitTextToSize(amc.fullAddress || '', 300);
      doc.text(addrLines, 40, currentY);
      doc.text(`Breakdown Visits: ${amc.maxBreakdownVisits || 0}`, 400, currentY);

      currentY += Math.max(addrLines.length * 15, 18);
      doc.text(`Pincode: ${amc.pincode || ''}`, 40, currentY);
      doc.text(`Maintenance Visits: ${amc.maxMaintenanceVisits || 0}`, 400, currentY);

      // --- Items Table ---
      currentY = 320;
      autoTable(doc, {
        startY: currentY,
        head: [['DESCRIPTION', 'QTY', 'AMOUNT']],
        body: [[
          `Annual Maintenance Contract: ${amc.packageName || ''} (${amc.numberOfCameras || 0} Cameras)`,
          '1',
          `Rs. ${amc.totalAmount || 0}`
        ]],
        theme: 'striped',
        headStyles: { fillColor: [241, 245, 249], textColor: [0, 0, 0] },
        styles: { fontSize: 11, cellPadding: 8 },
        columnStyles: {
          0: { cellWidth: 350 },
          1: { cellWidth: 50, halign: 'center' },
          2: { cellWidth: 115, halign: 'right' }
        },
        margin: { left: 40, right: 40 }
      });

      currentY = doc.lastAutoTable.finalY + 40;

      // Totals & GST
      if (amc.isGstInvoice) {
        const total = amc.totalAmount || 0;
        const baseAmount = total / 1.18;
        const tax = (total - baseAmount) / 2;
        doc.setTextColor(128, 128, 128);
        doc.text('Taxable Amount:', 350, currentY);
        doc.setTextColor(0, 0, 0);
        doc.text(`Rs. ${baseAmount.toFixed(2)}`, 550, currentY, { align: 'right' });
        currentY += 15;
        doc.setTextColor(128, 128, 128);
        doc.text('CGST (9%):', 350, currentY);
        doc.setTextColor(0, 0, 0);
        doc.text(`Rs. ${tax.toFixed(2)}`, 550, currentY, { align: 'right' });
        currentY += 15;
        doc.setTextColor(128, 128, 128);
        doc.text('SGST (9%):', 350, currentY);
        doc.setTextColor(0, 0, 0);
        doc.text(`Rs. ${tax.toFixed(2)}`, 550, currentY, { align: 'right' });
        currentY += 20;
        if (amc.gstNumber) {
          doc.setFont('helvetica', 'bold');
          doc.text(`Customer GSTIN: ${amc.gstNumber}`, 40, currentY - 20);
        }
      }

      doc.setDrawColor(211, 211, 211);
      doc.line(350, currentY, 555, currentY);
      currentY += 30;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('TOTAL AMOUNT', 350, currentY);
      doc.text(`Rs. ${amc.totalAmount || 0}`, 550, currentY, { align: 'right' });

      // Terms & Conditions
      currentY += 40;
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text('Terms & Conditions for AMC:', 40, currentY);
      currentY += 20;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const terms = [
        `1. ${amc.isGstInvoice ? "18% GST Included as per tax regulations." : "18% GST Extra as per tax regulations."}`,
        "2. The contract is applicable for the specified validity months from the agreement date.",
        "3. Equipment must be in working condition at contract signing; customer bears initial repair cost if faulty.",
        "4. Customer must provide ladder, water, power supply, and civil support for maintenance.",
        "5. Missing/stolen items during the contract are customer's liability, not covered under AMC.",
        "6. Technician access required during scheduled visits; no refund for missed appointments due to unavailability."
      ];
      
      terms.forEach(term => {
        const lines = doc.splitTextToSize(term, 515);
        doc.text(lines, 40, currentY);
        currentY += (lines.length * 14);
      });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('THANK YOU FOR CHOOSING EYE TECH SECURITIES', 297, 815, { align: 'center' });

      doc.save(`AMC_Invoice_${String(amc.id || '').slice(-6).toUpperCase()}.pdf`);
    } catch (err) {
      alert("AMC PDF Error: " + err.message);
    }
  }
};

export default InvoiceGenerator;

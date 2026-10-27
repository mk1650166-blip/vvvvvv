/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface GeneratePdfOptions {
  elementId: string;
  filename: string;
  title: string;
  downloadImmediately?: boolean;
}

/**
 * Captures the HTML element using html2canvas and compiles it into a high-resolution A4 PDF.
 * Ensures that Devanagari Hindi/Nepali fonts and complex ligatures render with 100% fidelity.
 */
export async function generateDevanagariPdfBlob({
  elementId,
  filename,
  title,
  downloadImmediately = true,
}: GeneratePdfOptions): Promise<Blob> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Report container element with id "${elementId}" not found`);
  }

  // Ensure all fonts (especially Noto Sans Devanagari) are fully loaded
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  // Temporary style adjustments for optimal standard A4 print capture
  const originalWidth = element.style.width;
  const originalTransform = element.style.transform;
  const originalMaxWidth = element.style.maxWidth;

  // Set fixed A4 printable width (794px at 96 DPI)
  element.style.width = '794px';
  element.style.maxWidth = '794px';
  element.style.transform = 'none';

  try {
    const canvas = await html2canvas(element, {
      scale: 2.5, // High DPI for crisp text, borders and print output
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      onclone: (clonedDoc) => {
        // Remove all Tailwind v4 stylesheets from the clone to prevent unsupported oklch/oklab color parsing errors
        clonedDoc.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
          // Keep font links
          if (node.tagName.toLowerCase() === 'link' && (node as HTMLLinkElement).href.includes('fonts.googleapis')) {
            return;
          }
          node.remove();
        });

        // Inject pristine, standard print styles for html2canvas
        const cleanStyle = clonedDoc.createElement('style');
        cleanStyle.textContent = `
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            color: #000000;
          }
          html, body {
            background-color: #ffffff !important;
            color: #000000 !important;
            font-family: 'Noto Sans Devanagari', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            width: 794px;
          }
          #report-paper {
            background-color: #ffffff !important;
            color: #000000 !important;
            width: 794px !important;
            max-width: 794px !important;
            padding: 28px !important;
            margin: 0 auto !important;
            border: none !important;
            box-shadow: none !important;
          }
          #report-paper h1 {
            font-size: 24px;
            font-weight: 800;
            text-align: center;
            color: #000000;
            margin-bottom: 4px;
            letter-spacing: 0.5px;
          }
          #report-paper p {
            font-size: 13px;
            text-align: center;
            color: #334155;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            border: 2px solid #000000 !important;
            margin-top: 12px;
          }
          th {
            background-color: #f1f5f9 !important;
            color: #000000 !important;
            border: 1px solid #000000 !important;
            padding: 7px 8px !important;
            font-size: 12px !important;
            font-weight: 800 !important;
          }
          td {
            border: 1px solid #000000 !important;
            padding: 5px 8px !important;
            font-size: 11px !important;
            color: #000000 !important;
          }
          tfoot tr {
            background-color: #f1f5f9 !important;
            font-weight: 800 !important;
          }
          tfoot td {
            border: 1px solid #000000 !important;
            padding: 8px !important;
            font-size: 13px !important;
            color: #000000 !important;
          }
          .font-mono {
            font-family: 'JetBrains Mono', monospace;
          }
        `;
        clonedDoc.head.appendChild(cleanStyle);

        // Sanitize inline styles on all cloned nodes
        clonedDoc.querySelectorAll('*').forEach((el) => {
          el.removeAttribute('style');
        });
      },
    });

    // Standard A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidthMm = 210;
    const pageHeightMm = 297;

    // Calculate canvas pixel height corresponding to one A4 page
    const pageHeightPx = Math.floor((canvas.width * pageHeightMm) / pageWidthMm);
    let renderedHeightPx = 0;
    let pageIndex = 0;

    // Paginate cleanly across multiple A4 pages if report is long
    while (renderedHeightPx < canvas.height) {
      const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedHeightPx);

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = pageHeightPx;
      const pageCtx = pageCanvas.getContext('2d');

      if (pageCtx) {
        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        pageCtx.drawImage(
          canvas,
          0,
          renderedHeightPx,
          canvas.width,
          sliceHeightPx,
          0,
          0,
          canvas.width,
          sliceHeightPx
        );
      }

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);

      if (pageIndex > 0) {
        pdf.addPage();
      }
      pdf.addImage(pageImgData, 'JPEG', 0, 0, pageWidthMm, pageHeightMm);

      renderedHeightPx += sliceHeightPx;
      pageIndex++;
    }

    const pdfBlob = pdf.output('blob');

    // Trigger direct browser download or mobile share if requested
    if (downloadImmediately) {
      const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
      const pdfFile = new File([pdfBlob], safeFilename, { type: 'application/pdf' });

      // In Android WebView APK or mobile browser, navigator.share with files is the most reliable way to save/export
      const canShareFile =
        typeof navigator !== 'undefined' &&
        !!navigator.share &&
        !!navigator.canShare &&
        navigator.canShare({ files: [pdfFile] });

      if (canShareFile) {
        try {
          await navigator.share({
            title: title || safeFilename,
            files: [pdfFile],
          });
          return pdfBlob;
        } catch (shareErr: any) {
          if (shareErr.name === 'AbortError') {
            // User cancelled share sheet
            return pdfBlob;
          }
          // Continue to anchor / window.open fallback
        }
      }

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = safeFilename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // In Android WebView, anchor download might fail silently without native DownloadListener.
      // If we detect Android or WebView, also open in external system window
      const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
      if (isAndroid) {
        try {
          window.open(url, '_blank');
        } catch {
          // ignore
        }
      }

      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }

    return pdfBlob;
  } finally {
    // Restore original styles
    element.style.width = originalWidth;
    element.style.maxWidth = originalMaxWidth;
    element.style.transform = originalTransform;
  }
}

/**
 * Triggers clean system printing for the sheet via window.print()
 */
export function triggerCleanPrint(): void {
  window.print();
}

/**
 * Launches WhatsApp on Android APK / iOS using the native whatsapp:// intent scheme,
 * with graceful fallback to wa.me for web browsers.
 */
export function openWhatsApp(text: string, phone?: string): void {
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const encodedText = encodeURIComponent(text);

  // 1. Native WhatsApp intent URL for Android WebView APK & mobile devices
  const deepLink = cleanPhone
    ? `whatsapp://send?phone=${cleanPhone}&text=${encodedText}`
    : `whatsapp://send?text=${encodedText}`;

  // 2. Web fallback link
  const webLink = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;

  try {
    // Setting window.location.href triggers the native WhatsApp app in Android APK & WebView
    window.location.href = deepLink;

    // Set fallback timeout if deep link doesn't take over (e.g. desktop browser)
    setTimeout(() => {
      try {
        window.open(webLink, '_blank', 'noopener,noreferrer');
      } catch {
        // ignore
      }
    }, 1500);
  } catch {
    window.open(webLink, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Shares report via Web Share API with PDF file, or falls back to WhatsApp Web + direct PDF download
 */
export async function shareReportWithPdf({
  elementId,
  filename,
  title,
  summaryText,
}: {
  elementId: string;
  filename: string;
  title: string;
  summaryText: string;
}): Promise<{ sharedViaNative: boolean; downloadedFallback: boolean }> {
  // 1. Generate the PDF Blob
  const pdfBlob = await generateDevanagariPdfBlob({
    elementId,
    filename,
    title,
    downloadImmediately: false,
  });

  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const pdfFile = new File([pdfBlob], safeFilename, { type: 'application/pdf' });

  // 2. Check if Web Share API with files is supported
  const canShareFiles =
    typeof navigator !== 'undefined' &&
    !!navigator.share &&
    !!navigator.canShare &&
    navigator.canShare({ files: [pdfFile] });

  if (canShareFiles) {
    try {
      await navigator.share({
        title,
        text: summaryText,
        files: [pdfFile],
      });
      return { sharedViaNative: true, downloadedFallback: false };
    } catch (shareError: any) {
      if (shareError.name === 'AbortError') {
        // User closed share dialog, nothing further needed
        return { sharedViaNative: false, downloadedFallback: false };
      }
      // If native sharing failed, fall through to WhatsApp fallback
    }
  }

  // 3. Fallback: Trigger direct PDF download and open WhatsApp with summary text
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = safeFilename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);

  // Copy text to clipboard
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(summaryText);
    }
  } catch {
    // ignore clipboard error
  }

  // Open WhatsApp directly via native Android APK intent
  openWhatsApp(summaryText);

  return { sharedViaNative: false, downloadedFallback: true };
}

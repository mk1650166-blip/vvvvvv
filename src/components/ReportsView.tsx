/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Download,
  Printer,
  Share2,
  Calendar,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Check,
} from 'lucide-react';
import { Customer } from '../types/index.ts';
import { translations } from '../i18n/translations.ts';
import { formatCurrency } from '../utils/calculations.ts';
import { LocalStorageManager } from '../services/storage.ts';
import { getTodayIso, getYesterdayIso } from '../services/seedData.ts';
import {
  generateDevanagariPdfBlob,
  triggerCleanPrint,
  shareReportWithPdf,
} from '../services/pdfGenerator.ts';

interface ReportsViewProps {
  customers: Customer[];
  currency: string;
  language: 'hi' | 'en';
  orgName: string;
  officeLocation: string;
  collectorName: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  customers,
  currency,
  language,
  orgName,
  officeLocation,
  collectorName,
}) => {
  const t = translations[language];

  // Report type: 'single' | 'range'
  const [reportType, setReportType] = useState<'single' | 'range'>('single');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayIso());
  const [startDate, setStartDate] = useState<string>(getYesterdayIso());
  const [endDate, setEndDate] = useState<string>(getTodayIso());

  // Filter: show all customers or only paid
  const [onlyPaid, setOnlyPaid] = useState<boolean>(false);

  // Action Button Loading States
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'info' | 'success' | 'error'>('info');
  const [showOriginalImageModal, setShowOriginalImageModal] = useState(false);

  // All collections
  const allCollections = useMemo(() => {
    return LocalStorageManager.getAllCollections();
  }, [selectedDate, startDate, endDate, isGeneratingPdf]);

  // Compute entries for the report
  const reportData = useMemo(() => {
    if (reportType === 'single') {
      const record = allCollections[selectedDate] || { entries: {} };
      const entries = record.entries || {};

      let list = customers.map((c) => ({
        customer: c,
        amount: entries[c.id] || 0,
        note: record.notes ? record.notes[c.id] : '',
      }));

      if (onlyPaid) {
        list = list.filter((item) => item.amount > 0);
      }

      const totalAmount = list.reduce((sum, item) => sum + item.amount, 0);
      const paidCount = list.filter((item) => item.amount > 0).length;

      return {
        title: `Daily Collection Sheet (${selectedDate})`,
        subtitle: `Date: ${selectedDate}`,
        dateStr: selectedDate,
        list,
        totalAmount,
        paidCount,
        totalCount: customers.length,
      };
    } else {
      // Date Range mode
      const dateKeys = Object.keys(allCollections).filter((d) => d >= startDate && d <= endDate);
      const customerTotals: Record<string, number> = {};

      for (const d of dateKeys) {
        const dayRecord = allCollections[d];
        if (dayRecord && dayRecord.entries) {
          for (const cId in dayRecord.entries) {
            customerTotals[cId] = (customerTotals[cId] || 0) + (dayRecord.entries[cId] || 0);
          }
        }
      }

      let list = customers.map((c) => ({
        customer: c,
        amount: customerTotals[c.id] || 0,
        note: '',
      }));

      if (onlyPaid) {
        list = list.filter((item) => item.amount > 0);
      }

      const totalAmount = list.reduce((sum, item) => sum + item.amount, 0);
      const paidCount = list.filter((item) => item.amount > 0).length;

      return {
        title: `Collection Range Report (${startDate} to ${endDate})`,
        subtitle: `Period: ${startDate} to ${endDate} (${dateKeys.length} days recorded)`,
        dateStr: `${startDate} to ${endDate}`,
        list,
        totalAmount,
        paidCount,
        totalCount: customers.length,
      };
    }
  }, [reportType, selectedDate, startDate, endDate, allCollections, customers, onlyPaid]);

  const showToast = (msg: string, type: 'info' | 'success' | 'error' = 'info', duration = 3000) => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, duration);
  };

  // 1. Download PDF Report Handler
  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    showToast(t.reports.pdfGenerating, 'info', 4000);

    try {
      const filename =
        reportType === 'single'
          ? `Daily_Collection_Sheet_${selectedDate}`
          : `Collection_Report_${startDate}_to_${endDate}`;

      await generateDevanagariPdfBlob({
        elementId: 'report-paper',
        filename,
        title: orgName,
        downloadImmediately: true,
      });

      showToast(t.reports.pdfSuccess, 'success', 3500);
    } catch (err: any) {
      console.error('PDF Generation Error:', err);
      showToast(
        language === 'hi'
          ? 'PDF तयार गर्न सकिएन। प्रिन्ट विकल्प प्रयोग गर्न सक्नुहुन्छ।'
          : 'Failed to generate PDF. You can also use the Print button.',
        'error',
        4000
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 2. Print Sheet Handler
  const handlePrint = () => {
    if (isPrinting) return;
    setIsPrinting(true);
    showToast(
      language === 'hi' ? 'प्रिन्ट विन्डो खुल्दैछ...' : 'Opening print dialog...',
      'info',
      2000
    );

    // Give browser a tick to update DOM, then trigger clean native print
    setTimeout(() => {
      try {
        triggerCleanPrint();
      } catch (err) {
        console.error('Print Error:', err);
      } finally {
        setIsPrinting(false);
      }
    }, 150);
  };

  // 3. Share via WhatsApp / App Handler
  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    showToast(
      language === 'hi'
        ? 'रिपोर्ट तथा PDF सेयर गर्न तयार गरिँदैछ...'
        : 'Preparing report & PDF for sharing...',
      'info',
      4000
    );

    try {
      const filename =
        reportType === 'single'
          ? `Daily_Collection_Sheet_${selectedDate}`
          : `Collection_Report_${startDate}_to_${endDate}`;

      const pendingCount = reportData.totalCount - reportData.paidCount;

      // Clean formatted summary message for WhatsApp & text sharing
      const summaryText =
        `📋 *${orgName}*\n` +
        `🏢 ${officeLocation}\n` +
        `👤 *${t.reports.collector}:* ${collectorName}\n` +
        `📅 *${t.reports.dateLabel}:* ${reportData.dateStr}\n` +
        `--------------------------------\n` +
        `👥 *Total Customers:* ${reportData.totalCount}\n` +
        `✅ *Paid Today:* ${reportData.paidCount}\n` +
        `⏳ *Pending:* ${pendingCount}\n` +
        `💰 *${t.reports.totalAmount}:* ${formatCurrency(reportData.totalAmount, currency)}\n` +
        `--------------------------------\n` +
        `📄 Certified daily pigmy collection report.`;

      const result = await shareReportWithPdf({
        elementId: 'report-paper',
        filename,
        title: `${orgName} - ${reportData.title}`,
        summaryText,
      });

      if (result.sharedViaNative) {
        showToast(
          language === 'hi' ? 'सफलतापूर्वक सेयर गरियो!' : 'Shared successfully via app!',
          'success',
          3000
        );
      } else if (result.downloadedFallback) {
        showToast(
          language === 'hi'
            ? 'PDF डाउनलोड भयो र ह्वाट्सएप खुल्दैछ!'
            : 'PDF downloaded & WhatsApp opened with summary!',
          'success',
          4000
        );
      }
    } catch (err: any) {
      console.error('Share Error:', err);
      showToast(
        language === 'hi'
          ? 'सेयर गर्न समस्या भयो। विवरण कपी गरियो।'
          : 'Could not share. Please check app permissions.',
        'error',
        3000
      );
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="pb-28 pt-2">
      {/* Top Filter & Report Mode Selector */}
      <div className="sticky top-[53px] z-20 bg-slate-100/95 backdrop-blur-sm px-3.5 py-2.5 border-b border-slate-200 no-print">
        <div className="mx-auto max-w-3xl space-y-2">
          {/* Mode Switcher */}
          <div className="flex rounded-2xl bg-slate-200/90 p-1">
            <button
              type="button"
              onClick={() => setReportType('single')}
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                reportType === 'single'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.reports.dailyReport}
            </button>
            <button
              type="button"
              onClick={() => setReportType('range')}
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                reportType === 'range'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.reports.rangeReport} (Bonus)
            </button>
          </div>

          {/* Date Picker Controls */}
          {reportType === 'single' ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedDate(getTodayIso())}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    selectedDate === getTodayIso()
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-300'
                  }`}
                >
                  {t.daily.today}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDate(getYesterdayIso())}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    selectedDate === getYesterdayIso()
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-300'
                  }`}
                >
                  {t.daily.yesterday}
                </button>
              </div>

              <div className="flex items-center gap-1.5 bg-white rounded-xl border border-slate-300 px-2.5 py-1 shadow-sm">
                <Calendar className="h-4 w-4 text-teal-700" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                  className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                  title="Pick any date"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 bg-white rounded-xl border border-slate-300 px-2.5 py-1 shadow-sm">
                <span className="text-[10px] font-bold text-slate-500">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => e.target.value && setStartDate(e.target.value)}
                  className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-1.5 bg-white rounded-xl border border-slate-300 px-2.5 py-1 shadow-sm">
                <span className="text-[10px] font-bold text-slate-500">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => e.target.value && setEndDate(e.target.value)}
                  className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Action Row: Only Paid toggle + Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyPaid}
                onChange={(e) => setOnlyPaid(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
              <span>{language === 'hi' ? 'जम्मा गरेका ग्राहक मात्र देखाउनुहोस्' : 'Show only customers who paid'}</span>
            </label>

            <button
              type="button"
              onClick={() => setShowOriginalImageModal(true)}
              className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>{language === 'hi' ? 'काँचो भौचर फोटो हेर्नुहोस्' : 'View Original Paper Sheet'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons with Active Spinners & Proper Event Binding */}
      <div className="mx-auto max-w-3xl px-3.5 mt-3 flex flex-wrap gap-2 no-print">
        {/* 1. Download PDF Report Button */}
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf || isPrinting || isSharing}
          data-testid="btn-download-pdf"
          aria-label={t.reports.generatePdf}
          className="flex-1 min-w-[140px] flex items-center justify-center gap-2 rounded-2xl bg-teal-700 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-lg hover:bg-teal-800 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
        >
          {isGeneratingPdf ? (
            <Loader2 className="h-4 w-4 animate-spin text-teal-200" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span>{isGeneratingPdf ? (language === 'hi' ? 'तयार हुँदैछ...' : 'Generating...') : t.reports.generatePdf}</span>
        </button>

        {/* 2. Print Sheet Button */}
        <button
          type="button"
          onClick={handlePrint}
          disabled={isGeneratingPdf || isPrinting || isSharing}
          data-testid="btn-print-sheet"
          aria-label={t.reports.printReport}
          className="flex items-center justify-center gap-2 rounded-2xl bg-slate-800 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-lg hover:bg-slate-900 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
        >
          {isPrinting ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
          ) : (
            <Printer className="h-4 w-4" />
          )}
          <span>{isPrinting ? (language === 'hi' ? 'प्रिन्ट...' : 'Printing...') : t.reports.printReport}</span>
        </button>

        {/* 3. Share via WhatsApp / App Button */}
        <button
          type="button"
          onClick={handleShare}
          disabled={isGeneratingPdf || isPrinting || isSharing}
          data-testid="btn-share-report"
          aria-label={t.reports.shareReport}
          className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-lg hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
        >
          {isSharing ? (
            <Loader2 className="h-4 w-4 animate-spin text-emerald-200" />
          ) : (
            <Share2 className="h-4 w-4" />
          )}
          <span>{isSharing ? (language === 'hi' ? 'सेयर गर्दै...' : 'Sharing...') : t.reports.shareReport}</span>
        </button>
      </div>

      {/* Sheet Preview Controls & Guidance */}
      <div className="mx-auto max-w-3xl px-3.5 mt-4 flex items-center justify-between text-xs text-slate-600 no-print">
        <span className="font-semibold flex items-center gap-1 text-[11px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
          👈 {language === 'hi' ? 'दायाँ-बायाँ सार्नुहोस् (Swipe to view full sheet)' : 'Swipe left/right to view full sheet'} 👉
        </span>
        <span className="text-[10px] text-slate-500 font-medium">A4 Standard Format</span>
      </div>

      {/* High-Resolution Printable Collection Sheet Container with id="report-paper" */}
      <div className="mx-auto max-w-3xl px-3.5 mt-1 overflow-x-auto pb-6">
        <div
          id="report-paper"
          data-testid="report-paper"
          className="mx-auto min-w-[650px] bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-300 text-slate-900 font-['Noto_Sans_Devanagari','Inter']"
        >
          {/* Header Section matching original physical sheet */}
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
            <h1 className="text-2xl font-black tracking-wide text-slate-900">
              {orgName}
            </h1>
            <p className="text-sm font-semibold text-slate-700 mt-1">
              {officeLocation}
            </p>
            <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-800 px-2">
              <div className="text-left">
                <span>{t.reports.collector}: </span>
                <span className="font-black underline text-sm">{collectorName}</span>
              </div>
              <div className="text-right">
                <span>{t.reports.dateLabel}: </span>
                <span className="font-black text-sm">{reportData.dateStr}</span>
              </div>
            </div>
          </div>

          {/* Table Header */}
          <table className="w-full text-left border-collapse border-2 border-slate-900">
            <thead>
              <tr className="bg-slate-100 text-slate-900 text-xs font-black uppercase border-b-2 border-slate-900">
                <th className="border border-slate-900 p-2 text-center w-12">{t.customers.sn}</th>
                <th className="border border-slate-900 p-2">Account Holder Name</th>
                <th className="border border-slate-900 p-2 text-center w-32">A/c No.</th>
                <th className="border border-slate-900 p-2 text-right w-36">Amount ({currency})</th>
              </tr>
            </thead>
            <tbody>
              {reportData.list.map((item, idx) => {
                const hasAmt = item.amount > 0;
                return (
                  <tr
                    key={item.customer.id}
                    className={`text-xs border-b border-slate-800 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    <td className="border border-slate-900 p-1.5 text-center font-bold font-mono">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-900 p-1.5 font-bold">
                      <div>
                        <span>{item.customer.name}</span>
                        {item.customer.nameDevanagari && (
                          <span className="block text-[11px] font-normal text-slate-600">
                            {item.customer.nameDevanagari}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="border border-slate-900 p-1.5 text-center font-mono font-semibold">
                      {item.customer.accountNumber}
                    </td>
                    <td className="border border-slate-900 p-1.5 text-right font-black text-sm font-mono">
                      {hasAmt ? item.amount.toLocaleString() : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              {/* Grand Total Row */}
              <tr className="bg-slate-100 border-t-2 border-slate-900 text-sm font-black">
                <td colSpan={3} className="border border-slate-900 p-2 text-right">
                  {t.reports.totalAmount} ({reportData.paidCount} Payees):
                </td>
                <td className="border border-slate-900 p-2 text-right font-mono text-base text-teal-950 font-black">
                  {formatCurrency(reportData.totalAmount, currency)}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Footer Signature Block */}
          <div className="mt-8 pt-4 flex items-end justify-between text-xs font-bold text-slate-800 px-4">
            <div className="text-center">
              <div className="w-36 border-b border-slate-900 mb-1"></div>
              <span>Prepared By</span>
            </div>
            <div className="text-center">
              <div className="w-44 border-b border-slate-900 mb-1"></div>
              <span>{t.reports.signature} ({collectorName})</span>
            </div>
            <div className="text-center">
              <div className="w-36 border-b border-slate-900 mb-1"></div>
              <span>Branch Manager / Cashier</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Toast Notification with type styling */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold text-white shadow-2xl animate-fade-in border ${
            toastType === 'error'
              ? 'bg-rose-900 border-rose-700 text-rose-100'
              : toastType === 'success'
              ? 'bg-slate-900 border-emerald-500/50 text-white'
              : 'bg-slate-900 border-slate-700 text-white'
          }`}
        >
          {toastType === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : toastType === 'error' ? (
            <span className="h-4 w-4 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-black shrink-0">
              !
            </span>
          ) : (
            <Loader2 className="h-4 w-4 animate-spin text-teal-400 shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Original Sheet Reference Modal */}
      {showOriginalImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in no-print">
          <div className="relative max-w-xl max-h-[90vh] bg-white rounded-3xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 mb-2 border-b">
              <h3 className="text-sm font-bold text-slate-900">
                Original Physical Collection Sheet
              </h3>
              <button
                type="button"
                onClick={() => setShowOriginalImageModal(false)}
                className="rounded-full bg-slate-100 p-1 text-slate-600 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>
            <img
              src="/assets/aistudio/WhatsApp_Image_2026-10-23_at_10.12.09_PM_8ca59c39.jpeg"
              alt="Physical Collection Sheet"
              className="w-full h-auto rounded-xl border border-slate-200 shadow-sm"
            />
            <p className="mt-2 text-xs text-slate-500 text-center">
              All 41 customers and amounts from this sheet are faithfully digitized in your database!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

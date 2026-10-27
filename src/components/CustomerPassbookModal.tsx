/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  X,
  BookOpen,
  Calendar,
  Undo2,
  Edit3,
  CheckCircle2,
  TrendingUp,
  Receipt,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { Customer } from '../types/index.ts';
import { formatCurrency } from '../utils/calculations.ts';
import { LocalStorageManager } from '../services/storage.ts';
import { openWhatsApp } from '../services/pdfGenerator.ts';

interface CustomerPassbookModalProps {
  customer: Customer | null;
  isOpen: boolean;
  currency: string;
  language: 'hi' | 'en';
  todayAmount: number;
  selectedDate: string;
  onClose: () => void;
  onUndoTodayEntry: (customerId: string) => void;
  onEditTodayEntry: (customerId: string) => void;
}

export const CustomerPassbookModal: React.FC<CustomerPassbookModalProps> = ({
  customer,
  isOpen,
  currency,
  language,
  todayAmount,
  selectedDate,
  onClose,
  onUndoTodayEntry,
  onEditTodayEntry,
}) => {
  if (!isOpen || !customer) return null;

  const history = useMemo(() => {
    return LocalStorageManager.getCustomerHistory(customer.id);
  }, [customer.id]);

  const summary = useMemo(() => {
    return LocalStorageManager.getCustomerCollectionSummary(customer.id, selectedDate);
  }, [customer.id, selectedDate]);

  const isPaidToday = todayAmount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-white p-4 sm:p-5 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <Receipt className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">
                  {language === 'hi' ? 'ग्राहक पासबुक' : 'Mini Passbook'}
                </span>
                <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-mono font-bold text-slate-700">
                  #{customer.sn}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                A/c: {customer.accountNumber}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:scale-95 transition-all"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-3 overflow-y-auto pr-0.5 flex-1">
          {/* Customer Bio */}
          <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200/80">
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              {customer.name}
            </h3>
            {customer.nameDevanagari && (
              <p className="text-xs font-medium text-slate-600 font-['Noto_Sans_Devanagari'] mt-0.5">
                {customer.nameDevanagari}
              </p>
            )}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
              <span>A/c: <strong className="font-mono text-slate-800">{customer.accountNumber}</strong></span>
              {customer.phone && (
                <span className="flex items-center gap-1 font-mono text-slate-700">
                  <Phone className="h-3 w-3 text-slate-400" />
                  {customer.phone}
                </span>
              )}
            </div>
          </div>

          {/* Balance Summary Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-emerald-950 p-2.5 text-white shadow-xs">
              <span className="text-[10px] font-medium text-emerald-300 block uppercase tracking-wider">
                {language === 'hi' ? 'कुल बचत (Total Balance)' : 'Total Balance'}
              </span>
              <span className="text-sm font-bold font-mono tracking-tight block mt-0.5">
                {formatCurrency(summary.lifetimeTotal, currency)}
              </span>
              <span className="text-[9px] text-emerald-400/80 block mt-0.5">
                {summary.totalPaymentsCount} {language === 'hi' ? 'किस्ता जम्मा' : 'installments'}
              </span>
            </div>

            <div className="rounded-2xl bg-teal-900 p-2.5 text-white shadow-xs">
              <span className="text-[10px] font-medium text-teal-200 block uppercase tracking-wider">
                {language === 'hi' ? 'यस महिना (This Month)' : 'This Month'}
              </span>
              <span className="text-sm font-bold font-mono tracking-tight block mt-0.5">
                {formatCurrency(summary.currentMonthTotal, currency)}
              </span>
              <span className="text-[9px] text-teal-300/80 block mt-0.5">
                {summary.monthlyPaymentsCount} {language === 'hi' ? 'पटक' : 'payments'}
              </span>
            </div>
          </div>

          {/* Today's Entry Status / Edit & Undo Actions */}
          <div className={`rounded-2xl p-3 border transition-all ${
            isPaidToday
              ? 'bg-emerald-50/70 border-emerald-300'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-slate-500 block uppercase">
                  {selectedDate} ({language === 'hi' ? 'चयनित मिति' : 'Selected Date'})
                </span>
                <span className="text-xs font-bold font-mono text-slate-900">
                  {isPaidToday ? formatCurrency(todayAmount, currency) : (language === 'hi' ? 'बाँकी (Unpaid)' : 'Unpaid')}
                </span>
              </div>

              {isPaidToday ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onEditTodayEntry(customer.id)}
                    className="flex items-center gap-1 rounded-xl border border-emerald-600 bg-white px-2.5 py-1 text-[11px] font-bold text-emerald-700 shadow-2xs hover:bg-emerald-50 active:scale-95 transition-all"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>{language === 'hi' ? 'सच्याउनुहोस्' : 'Edit'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const receiptMsg =
                        `🧾 *सङ्कलन रसिद (Daily Pigmy Receipt)*\n` +
                        `👤 *Customer:* ${customer.name}\n` +
                        `🔢 *A/c:* ${customer.accountNumber}\n` +
                        `📅 *Date:* ${selectedDate}\n` +
                        `💰 *Paid Today:* ${formatCurrency(todayAmount, currency)}\n` +
                        `📊 *Total Balance:* ${formatCurrency(summary.lifetimeTotal, currency)}\n` +
                        `--------------------------------\n` +
                        `श्री बन्धन बचत तथा ऋण सहकारी संस्था लि.`;
                      openWhatsApp(receiptMsg, customer.phone);
                    }}
                    className="flex items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-800 shadow-2xs hover:bg-emerald-100 active:scale-95 transition-all"
                    title="Send WhatsApp Receipt"
                  >
                    <MessageSquare className="h-3 w-3 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onUndoTodayEntry(customer.id)}
                    className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700 shadow-2xs hover:bg-rose-100 active:scale-95 transition-all"
                    title="Undo / Clear today's collection for this customer"
                  >
                    <Undo2 className="h-3 w-3" />
                    <span>{language === 'hi' ? 'हटाउनुहोस्' : 'Undo'}</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onEditTodayEntry(customer.id)}
                  className="rounded-xl bg-emerald-700 px-3 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-emerald-800 active:scale-95 transition-all"
                >
                  {language === 'hi' ? 'सङ्कलन प्रविष्टि' : 'Enter Amount'}
                </button>
              )}
            </div>
          </div>

          {/* Last 5 Collection Entries */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700">
                {language === 'hi' ? 'अन्तिम ५ सङ्कलन रेकर्डहरू' : 'Last 5 Collection Entries'}
              </span>
              <span className="text-[10px] text-slate-400">
                {history.length} {language === 'hi' ? 'वटा कुल' : 'total'}
              </span>
            </div>

            {history.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-400 border border-slate-100">
                {language === 'hi' ? 'पहिले कुनै सङ्कलन रेकर्ड छैन' : 'No previous collection records'}
              </div>
            ) : (
              <div className="space-y-1.5">
                {history.slice(0, 5).map((item, idx) => (
                  <div
                    key={item.date + idx}
                    className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs border border-slate-200/90 shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        ✓
                      </div>
                      <span className="font-mono text-slate-700 text-[11px]">
                        {item.date}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-[11px]">
                      {formatCurrency(item.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 mt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 active:scale-95 transition-all"
          >
            {language === 'hi' ? 'बन्द गर्नुहोस्' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

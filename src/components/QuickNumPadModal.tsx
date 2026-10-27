/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { X, Delete, ChevronRight, Check, Calendar, TrendingUp, Calculator, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Customer } from '../types/index.ts';
import { formatCurrency } from '../utils/calculations.ts';
import { LocalStorageManager } from '../services/storage.ts';
import { fetchCustomerTotalCollectionFromSupabase } from '../services/supabase.ts';

interface QuickNumPadModalProps {
  customer: Customer | null;
  currentAmount: number;
  currency: string;
  isOpen: boolean;
  selectedDate?: string;
  onClose: () => void;
  onSaveAmount: (customerId: string, amount: number) => void;
  onNextCustomer?: () => void;
  hasNext: boolean;
}

export const QuickNumPadModal: React.FC<QuickNumPadModalProps> = ({
  customer,
  currentAmount,
  currency,
  isOpen,
  selectedDate,
  onClose,
  onSaveAmount,
  onNextCustomer,
  hasNext,
}) => {
  const [val, setVal] = useState<string>('');
  const [showCalculatorHistory, setShowCalculatorHistory] = useState<boolean>(false);
  const [stats, setStats] = useState<{
    lifetimeTotal: number;
    currentMonthTotal: number;
    currentMonth: string;
    totalPaymentsCount: number;
    monthlyPaymentsCount: number;
  }>({
    lifetimeTotal: 0,
    currentMonthTotal: 0,
    currentMonth: (selectedDate || new Date().toISOString().slice(0, 10)).slice(0, 7),
    totalPaymentsCount: 0,
    monthlyPaymentsCount: 0,
  });

  const activeDate = selectedDate || new Date().toISOString().slice(0, 10);

  const customerHistory = useMemo(() => {
    if (!customer) return [];
    return LocalStorageManager.getCustomerHistory(customer.id);
  }, [customer]);

  useEffect(() => {
    if (customer && isOpen) {
      setVal(currentAmount > 0 ? currentAmount.toString() : '');

      // 1. Instant local calculation
      const localStats = LocalStorageManager.getCustomerCollectionSummary(customer.id, selectedDate);
      setStats({
        lifetimeTotal: Math.max(localStats.lifetimeTotal, customer.totalCollected || 0),
        currentMonthTotal: localStats.currentMonthTotal,
        currentMonth: localStats.currentMonth,
        totalPaymentsCount: localStats.totalPaymentsCount,
        monthlyPaymentsCount: localStats.monthlyPaymentsCount,
      });

      // 2. Async check against Supabase if online
      let isMounted = true;
      fetchCustomerTotalCollectionFromSupabase(customer.id, selectedDate).then((remote) => {
        if (isMounted && remote) {
          setStats((prev) => ({
            ...prev,
            lifetimeTotal: Math.max(prev.lifetimeTotal, remote.lifetimeTotal),
            currentMonthTotal: Math.max(prev.currentMonthTotal, remote.currentMonthTotal),
          }));
        }
      });

      return () => {
        isMounted = false;
      };
    }
  }, [customer, currentAmount, isOpen, selectedDate]);

  if (!isOpen || !customer) return null;

  const handleDigit = (d: string) => {
    if (val.length < 7) {
      setVal((prev) => (prev === '0' ? d : prev + d));
    }
  };

  const handleAddPreset = (increment: number) => {
    const current = parseInt(val, 10) || 0;
    setVal((current + increment).toString());
  };

  const handleSetPreset = (preset: number) => {
    setVal(preset.toString());
  };

  const handleBackspace = () => {
    setVal((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setVal('');
  };

  const handleSave = () => {
    const amt = parseInt(val, 10) || 0;
    onSaveAmount(customer.id, amt);
    onClose();
  };

  const handleSaveAndNext = () => {
    const amt = parseInt(val, 10) || 0;
    onSaveAmount(customer.id, amt);
    if (onNextCustomer && hasNext) {
      onNextCustomer();
    } else {
      onClose();
    }
  };

  const numericVal = parseInt(val, 10) || 0;
  const todayPaidAlready = currentAmount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in select-none">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white p-5 shadow-2xl border border-slate-200 max-h-[94vh] flex flex-col overflow-y-auto">
        {/* Header with Customer Info & Calculator Details Toggle */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-teal-50 text-xs font-bold text-teal-800 border border-teal-200 font-mono shadow-xs">
                {customer.sn}
              </span>
              <h2 className="text-base font-bold text-slate-900 leading-tight truncate">
                {customer.name}
              </h2>
            </div>
            {customer.nameDevanagari && (
              <p className="text-xs font-medium text-slate-500 font-['Noto_Sans_Devanagari'] ml-9 truncate">
                {customer.nameDevanagari}
              </p>
            )}
            <p className="text-[11px] text-slate-500 ml-9 truncate">
              A/c: <span className="font-mono font-semibold text-slate-800">{customer.accountNumber}</span>
              {customer.note ? ` • ${customer.note}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Calculator History Trigger Icon */}
            <button
              type="button"
              onClick={() => setShowCalculatorHistory((prev) => !prev)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs ${
                showCalculatorHistory
                  ? 'bg-teal-700 text-white border-teal-800'
                  : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
              }`}
              title="Calculator: View Today & Lifetime Collection"
              aria-label="Calculator: View Today & Lifetime Collection"
            >
              <Calculator className="h-4 w-4" />
              <span>हिसाब</span>
              {showCalculatorHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Customer Collection Summary: Today's Amount & Total Lifetime Collection */}
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-2.5 border border-slate-200">
          {/* Today's Collection for this Customer */}
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <Calendar className="h-3 w-3 text-teal-600 shrink-0" />
              <span className="truncate">आजको संकलन ({activeDate})</span>
            </div>
            <div className="text-sm font-black text-slate-900 mt-0.5 truncate font-mono">
              {formatCurrency(currentAmount || 0, currency)}
            </div>
            <div className="text-[10px] font-medium">
              {todayPaidAlready ? (
                <span className="text-emerald-700 font-bold">✓ आज संकलित</span>
              ) : (
                <span className="text-slate-400">आज बाँकी (0)</span>
              )}
            </div>
          </div>

          {/* Customer's Total Lifetime Collection */}
          <div className="min-w-0 border-l border-slate-200 pl-2.5">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <TrendingUp className="h-3 w-3 text-emerald-600 shrink-0" />
              <span className="truncate">कुल संकलन (Lifetime)</span>
            </div>
            <div className="text-sm font-black text-emerald-700 mt-0.5 truncate font-mono">
              {formatCurrency(stats.lifetimeTotal, currency)}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              {stats.totalPaymentsCount > 0 ? `जम्मा ${stats.totalPaymentsCount} पटक भुक्तानी` : 'पहिलो संकलन'}
            </div>
          </div>
        </div>

        {/* Expandable Calculator History Breakdown */}
        {showCalculatorHistory && (
          <div className="mt-2.5 rounded-2xl bg-teal-50/80 p-3 border border-teal-200 text-xs animate-fade-in space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-teal-200/80 font-bold text-teal-900">
              <span className="flex items-center gap-1">
                <Calculator className="h-3.5 w-3.5 text-teal-700" />
                ग्राहक संकलन हिसाब विवरण:
              </span>
              <span className="text-[11px] text-teal-700 font-mono">A/c: {customer.accountNumber}</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center py-1">
              <div className="bg-white/80 p-1.5 rounded-xl border border-teal-100">
                <div className="text-[10px] text-slate-500">आज ({activeDate})</div>
                <div className="font-mono font-bold text-teal-950 mt-0.5">
                  {formatCurrency(currentAmount || 0, currency)}
                </div>
              </div>
              <div className="bg-white/80 p-1.5 rounded-xl border border-teal-100">
                <div className="text-[10px] text-slate-500">यस महिना ({stats.currentMonth})</div>
                <div className="font-mono font-bold text-teal-950 mt-0.5">
                  {formatCurrency(stats.currentMonthTotal, currency)}
                </div>
              </div>
              <div className="bg-white/80 p-1.5 rounded-xl border border-teal-100">
                <div className="text-[10px] text-slate-500">कुल संकलन (Lifetime)</div>
                <div className="font-mono font-bold text-emerald-800 mt-0.5">
                  {formatCurrency(stats.lifetimeTotal, currency)}
                </div>
              </div>
            </div>

            {/* Recent Payments List */}
            <div className="max-h-28 overflow-y-auto space-y-1 pt-1 border-t border-teal-200/60 pr-1">
              <span className="text-[10px] font-bold text-teal-800 block">पछिल्ला भुक्तानीहरू (History):</span>
              {customerHistory.length === 0 ? (
                <div className="text-[11px] text-slate-500 italic py-1">कुनै अघिल्लो संकलन रेकर्ड भेटिएन।</div>
              ) : (
                customerHistory.slice(0, 5).map((h, i) => (
                  <div key={i} className="flex justify-between items-center text-[11px] bg-white/70 px-2 py-1 rounded-lg">
                    <span className="font-mono text-slate-700">{h.date}</span>
                    <span className="font-mono font-bold text-teal-900">{formatCurrency(h.amount, currency)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Amount Display */}
        <div className="my-2.5 flex items-center justify-between rounded-2xl bg-teal-50/70 p-3 border border-teal-200/70">
          <button
            type="button"
            onClick={() => setShowCalculatorHistory((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950 uppercase tracking-wider text-left"
            title="Click to view today & lifetime breakdown"
          >
            <Calculator className="h-4 w-4 text-teal-700" />
            <span>Amount ({activeDate}):</span>
          </button>
          <div className="text-right">
            <span className="text-2xl font-black text-teal-900 tracking-tight font-mono">
              {formatCurrency(numericVal, currency)}
            </span>
          </div>
        </div>

        {/* Preset Chips */}
        <div className="grid grid-cols-5 gap-1.5 mb-2.5">
          {[50, 100, 200, 300, 500].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleSetPreset(preset)}
              className="rounded-xl bg-slate-100 py-1.5 text-xs font-bold text-slate-700 hover:bg-teal-100 hover:text-teal-800 active:scale-95 transition-all border border-slate-200"
            >
              +{preset}
            </button>
          ))}
        </div>

        {/* Large Keypad */}
        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="flex h-12 items-center justify-center rounded-2xl bg-slate-50 text-xl font-bold text-slate-800 border border-slate-200/90 active:bg-teal-600 active:text-white active:scale-95 transition-all"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="flex h-12 items-center justify-center rounded-2xl bg-rose-50 text-sm font-bold text-rose-600 border border-rose-200 active:bg-rose-100 active:scale-95 transition-all"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="flex h-12 items-center justify-center rounded-2xl bg-slate-50 text-xl font-bold text-slate-800 border border-slate-200/90 active:bg-teal-600 active:text-white active:scale-95 transition-all"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="flex h-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 active:bg-slate-200 active:scale-95 transition-all"
            aria-label="Delete"
          >
            <Delete className="h-5 w-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-slate-200 py-3 text-sm font-bold text-slate-800 hover:bg-slate-300 active:scale-95 transition-all"
          >
            <Check className="h-4 w-4" />
            <span>Done</span>
          </button>
          {hasNext && (
            <button
              type="button"
              onClick={handleSaveAndNext}
              className="flex-[1.5] flex items-center justify-center gap-1.5 rounded-2xl bg-teal-600 py-3 text-sm font-bold text-white hover:bg-teal-700 active:scale-95 transition-all shadow-md"
            >
              <span>Save & Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

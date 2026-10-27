/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  Save,
  ArrowUpDown,
  Calculator,
  ChevronLeft,
  ChevronRight,
  X,
  Receipt,
  BookOpen,
} from 'lucide-react';
import { Customer, DailyCollectionRecord } from '../types/index.ts';
import { translations } from '../i18n/translations.ts';
import { calculateDailyStats, formatCurrency, filterCustomers } from '../utils/calculations.ts';
import { LocalStorageManager } from '../services/storage.ts';
import { getTodayIso, getYesterdayIso } from '../services/seedData.ts';
import { fetchDailyRecordForDateFromSupabase, deleteCollectionEntryFromSupabase } from '../services/supabase.ts';
import { QuickNumPadModal } from './QuickNumPadModal.tsx';
import { CustomerPassbookModal } from './CustomerPassbookModal.tsx';
import confetti from 'canvas-confetti';

interface DailyEntryViewProps {
  customers: Customer[];
  currency: string;
  language: 'hi' | 'en';
  onUnsavedStateChange: (hasUnsaved: boolean) => void;
  onRequestDateChangePrompt: (targetDate: string) => boolean;
  resetTrigger?: number;
}

export const DailyEntryView: React.FC<DailyEntryViewProps> = ({
  customers,
  currency,
  language,
  onUnsavedStateChange,
  resetTrigger,
}) => {
  const t = translations[language];

  // Selected date state
  const [selectedDate, setSelectedDate] = useState<string>(getTodayIso());
  // Current working amounts for this selected date
  const [entries, setEntries] = useState<Record<string, number>>({});
  const [initialEntries, setInitialEntries] = useState<Record<string, number>>({});
  // Optional customer notes for this date
  const [notes, setNotes] = useState<Record<string, string>>({});

  // UI Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'sn' | 'name' | 'amount'>('sn');

  // Interactive Date Picker Popover/Modal state
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [customDateInput, setCustomDateInput] = useState(selectedDate);

  // Quick NumPad Modal state
  const [numpadCustomer, setNumpadCustomer] = useState<Customer | null>(null);
  // Mini-Passbook Modal state
  const [passbookCustomer, setPassbookCustomer] = useState<Customer | null>(null);

  const [showSavedToast, setShowSavedToast] = useState(false);
  const [justSavedId, setJustSavedId] = useState<string | null>(null);
  const [flashingCustId, setFlashingCustId] = useState<string | null>(null);

  const todayIso = getTodayIso();
  const yesterdayIso = getYesterdayIso();
  const isToday = selectedDate === todayIso;

  // Home reset listener
  useEffect(() => {
    if (resetTrigger && resetTrigger > 0) {
      setSearchQuery('');
      setStatusFilter('all');
      setSortBy('sn');
    }
  }, [resetTrigger]);

  // Sync customDateInput whenever selectedDate updates
  useEffect(() => {
    setCustomDateInput(selectedDate);
  }, [selectedDate]);

  // Load record strictly matching selectedDate on date change
  useEffect(() => {
    const record = LocalStorageManager.getDailyRecord(selectedDate);
    const loadedEntries = { ...(record.entries || {}) };
    const loadedNotes = { ...(record.notes || {}) };
    setEntries(loadedEntries);
    setInitialEntries(loadedEntries);
    setNotes(loadedNotes);
    onUnsavedStateChange(false);

    let isMounted = true;
    fetchDailyRecordForDateFromSupabase(selectedDate).then((remoteRecord) => {
      if (isMounted && remoteRecord) {
        const remotePositiveEntries = { ...remoteRecord.entries };
        setEntries(remotePositiveEntries);
        setInitialEntries(remotePositiveEntries);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedDate, onUnsavedStateChange]);

  // Compute if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    const allKeys = Array.from(new Set([...Object.keys(entries), ...Object.keys(initialEntries)]));
    for (const key of allKeys) {
      const current = entries[key] || 0;
      const initial = initialEntries[key] || 0;
      if (current !== initial) return true;
    }
    return false;
  }, [entries, initialEntries]);

  useEffect(() => {
    onUnsavedStateChange(hasUnsavedChanges);
  }, [hasUnsavedChanges, onUnsavedStateChange]);

  // Daily statistics
  const stats = useMemo(() => {
    return calculateDailyStats(entries, customers.length);
  }, [entries, customers.length]);

  // Filtered and sorted customers (with exact serial jump prioritization)
  const filteredCustomers = useMemo(() => {
    let result = filterCustomers(customers, searchQuery);

    if (statusFilter === 'paid') {
      result = result.filter((c) => (entries[c.id] || 0) > 0);
    } else if (statusFilter === 'pending') {
      result = result.filter((c) => !entries[c.id] || entries[c.id] === 0);
    }

    // Only apply standard sorting if not an exact S.N search jump
    const isPureSnSearch = /^\s*#?\d+\s*$/.test(searchQuery);
    if (!isPureSnSearch) {
      result = result.sort((a, b) => {
        if (sortBy === 'sn') return a.sn - b.sn;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'amount') return (entries[b.id] || 0) - (entries[a.id] || 0);
        return 0;
      });
    }

    return result;
  }, [customers, searchQuery, statusFilter, sortBy, entries]);

  // Handle amount change for customer
  const handleAmountChange = (customerId: string, val: string) => {
    const cleanNum = parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
    setEntries((prev) => ({
      ...prev,
      [customerId]: cleanNum,
    }));
  };

  // Quick preset add with subtle flash feedback
  const handleIncrement = (customerId: string, addAmount: number) => {
    setEntries((prev) => {
      const current = prev[customerId] || 0;
      return {
        ...prev,
        [customerId]: current + addAmount,
      };
    });
    setFlashingCustId(customerId);
    setTimeout(() => {
      setFlashingCustId((curr) => (curr === customerId ? null : curr));
    }, 400);
  };

  const handleClearAmount = (customerId: string) => {
    setEntries((prev) => {
      const updated = { ...prev };
      delete updated[customerId];
      return updated;
    });
  };

  // Save single customer entry inline (with real Supabase delete if amount is 0 or cleared)
  const handleSaveCustomer = (customerId: string) => {
    const amt = entries[customerId] || 0;
    const cleanEntries = { ...entries };
    if (amt <= 0) {
      delete cleanEntries[customerId];
      // Execute real deletion in Supabase!
      deleteCollectionEntryFromSupabase(selectedDate, customerId);
    }
    const record: DailyCollectionRecord = {
      date: selectedDate,
      entries: cleanEntries,
      notes,
      updatedAt: new Date().toISOString(),
    };
    LocalStorageManager.saveDailyRecord(record);
    setEntries(cleanEntries);
    setInitialEntries((prev) => {
      const updated = { ...prev };
      if (amt <= 0) {
        delete updated[customerId];
      } else {
        updated[customerId] = amt;
      }
      return updated;
    });
    setJustSavedId(customerId);
    setTimeout(() => {
      setJustSavedId((curr) => (curr === customerId ? null : curr));
    }, 1500);
  };

  // Undo / reset customer's today entry (executes real .delete() in Supabase)
  const handleUndoCustomerToday = (customerId: string) => {
    const cleanEntries = { ...entries };
    delete cleanEntries[customerId];
    setEntries(cleanEntries);

    const record: DailyCollectionRecord = {
      date: selectedDate,
      entries: cleanEntries,
      notes,
      updatedAt: new Date().toISOString(),
    };
    LocalStorageManager.saveDailyRecord(record);
    // Execute real deletion in Supabase!
    deleteCollectionEntryFromSupabase(selectedDate, customerId);

    setInitialEntries((prev) => {
      const updated = { ...prev };
      delete updated[customerId];
      return updated;
    });
    setPassbookCustomer(null);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  // Edit today entry from passbook
  const handleEditCustomerToday = (customerId: string) => {
    const cust = customers.find((c) => c.id === customerId);
    setPassbookCustomer(null);
    if (cust) {
      setNumpadCustomer(cust);
    }
  };

  // Save all changes (filters out zero entries and syncs)
  const handleSaveAll = () => {
    const cleanEntries: Record<string, number> = {};
    for (const cId in entries) {
      if (entries[cId] > 0) {
        cleanEntries[cId] = entries[cId];
      }
    }
    const record: DailyCollectionRecord = {
      date: selectedDate,
      entries: cleanEntries,
      notes,
      updatedAt: new Date().toISOString(),
    };
    LocalStorageManager.saveDailyRecord(record);
    setEntries(cleanEntries);
    setInitialEntries({ ...cleanEntries });
    onUnsavedStateChange(false);
    setShowSavedToast(true);

    if (stats.paidCount > 10) {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 },
      });
    }

    setTimeout(() => setShowSavedToast(false), 2000);
  };

  // Step Date by days
  const handleStepDate = (offsetDays: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offsetDays);
    const newDateStr = d.toISOString().slice(0, 10);
    setSelectedDate(newDateStr);
  };

  // Direct date change submit from modal
  const handleApplyDateModal = (dateStr: string) => {
    if (!dateStr) return;
    setSelectedDate(dateStr);
    setShowDatePickerModal(false);
  };

  // Next customer in NumPad navigation
  const currentIndex = numpadCustomer ? filteredCustomers.findIndex((c) => c.id === numpadCustomer.id) : -1;
  const hasNextCustomer = currentIndex >= 0 && currentIndex < filteredCustomers.length - 1;
  const nextCustomer = hasNextCustomer ? filteredCustomers[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* 1. POLISHED ULTRA-SLIM STICKY KPI RIBBON */}
      <div className="sticky top-11 z-20 h-10 bg-emerald-950 text-white px-2.5 py-1.5 border-b border-emerald-900 shadow-xs flex items-center justify-between gap-1 whitespace-nowrap overflow-hidden select-none">
        {/* Left: TOTAL + Live Amount */}
        <div className="flex items-baseline gap-1 shrink-0">
          <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-400/80">TOTAL</span>
          <span className="text-xs sm:text-sm font-bold font-mono tracking-tight text-white">
            {formatCurrency(stats.totalAmount, currency)}
          </span>
        </div>

        {/* Center/Right: Micro-pills + Interactive Date Stepper Trigger */}
        <div className="flex items-center gap-1 text-[10px] font-mono shrink-0">
          <span className="bg-emerald-800/80 text-emerald-200 px-1.5 py-0.5 rounded font-medium text-[10px]">
            Paid: {stats.paidCount}
          </span>
          <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-medium text-[10px]">
            Pending: {stats.unpaidCount}
          </span>

          {/* Interactive Date Trigger with 1-Tap Chevrons */}
          <div className="flex items-center bg-emerald-900/90 rounded border border-emerald-700/60 p-0.5">
            <button
              type="button"
              onClick={() => handleStepDate(-1)}
              className="h-5 w-4 flex items-center justify-center text-emerald-300 hover:text-white active:scale-90"
              title="Previous Day (अघिल्लो दिन)"
              aria-label="Previous Day"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>

            <button
              type="button"
              onClick={() => {
                setCustomDateInput(selectedDate);
                setShowDatePickerModal(true);
              }}
              className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-medium text-emerald-100 hover:text-white active:scale-95 transition-all"
              title="Click to pick or type date (मिति परिवर्तन गर्नुहोस्)"
            >
              <Calendar className="h-2.5 w-2.5 text-emerald-300 shrink-0" />
              <span>{isToday ? (language === 'hi' ? 'आज' : 'Today') : selectedDate.slice(5)}</span>
            </button>

            <button
              type="button"
              onClick={() => handleStepDate(1)}
              className="h-5 w-4 flex items-center justify-center text-emerald-300 hover:text-white active:scale-90"
              title="Next Day (पछिल्लो दिन)"
              aria-label="Next Day"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. COMPACT STICKY SEARCH & FILTER BAR */}
      <div className="sticky top-[84px] z-20 bg-slate-50/95 backdrop-blur-md px-3 py-1.5 border-b border-slate-200 shadow-2xs">
        {/* Row 1: Search Input (with Instant Clear × Button & Serial Jump) + Sort Button */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, S.N (e.g. 1, #102) or A/c..."
              className="h-8 w-full rounded-md border border-slate-300 bg-white pl-8 pr-7 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1.5 text-xs text-slate-400 hover:text-slate-600 font-bold p-0.5 leading-none"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (sortBy === 'sn') setSortBy('name');
              else if (sortBy === 'name') setSortBy('amount');
              else setSortBy('sn');
            }}
            className="h-8 shrink-0 flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 text-[11px] font-semibold text-slate-700 shadow-2xs active:bg-slate-100"
            title="Sort List"
          >
            <ArrowUpDown className="h-3 w-3 text-emerald-700" />
            <span>{sortBy === 'sn' ? 'S.N' : sortBy === 'name' ? 'Name' : 'Amt'}</span>
          </button>

          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={handleSaveAll}
              className="h-8 shrink-0 flex items-center gap-1 rounded-md bg-amber-600 active:bg-amber-700 text-white px-2.5 text-[11px] font-semibold shadow-xs animate-pulse"
              title="Save all changes"
            >
              <Save className="h-3 w-3" />
              <span>{language === 'hi' ? 'सबै सेभ' : 'Save All'}</span>
            </button>
          )}
        </div>

        {/* Row 2: SLEEK SINGLE-LINE SEGMENTED TAB BAR (NO TEXT CLIPPING) */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/80 rounded-lg h-9 items-center mt-1.5 select-none">
          {/* Tab 1: All */}
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`h-7 px-1.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>All</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono leading-tight ${
                statusFilter === 'all' ? 'bg-slate-800 text-slate-200' : 'bg-slate-300/80 text-slate-700'
              }`}
            >
              {customers.length}
            </span>
          </button>

          {/* Tab 2: Paid */}
          <button
            type="button"
            onClick={() => setStatusFilter('paid')}
            className={`h-7 px-1.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
              statusFilter === 'paid'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Paid</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono leading-tight ${
                statusFilter === 'paid' ? 'bg-emerald-950 text-emerald-300 font-bold' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {stats.paidCount}
            </span>
          </button>

          {/* Tab 3: Pending */}
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`h-7 px-1.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
              statusFilter === 'pending'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
            <span>Pending</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono leading-tight ${
                statusFilter === 'pending' ? 'bg-amber-950 text-amber-300 font-bold' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {stats.unpaidCount}
            </span>
          </button>
        </div>
      </div>

      {/* 3. HIGH-DENSITY CUSTOMER COLLECTION CARDS */}
      <div className="mx-auto max-w-3xl px-3 pt-2 pb-20 space-y-2">
        {filteredCustomers.length === 0 ? (
          <div className="rounded-lg bg-white p-6 text-center border border-slate-200 text-xs text-slate-500">
            {t.daily.noEntriesFound}
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const amount = entries[cust.id] || 0;
            const isPaid = amount > 0;
            const isUnsavedModified = (entries[cust.id] || 0) !== (initialEntries[cust.id] || 0);
            const isAlreadyPaid = (initialEntries[cust.id] || 0) > 0;
            const isJustSaved = justSavedId === cust.id;
            const isZeroUnpaid = (!amount || amount === 0) && !isAlreadyPaid;

            return (
              <div
                key={cust.id}
                className={`p-2.5 mb-2 rounded-lg bg-white border shadow-2xs transition-all ${
                  isPaid
                    ? 'border-l-4 border-l-emerald-500 border-slate-200/90 bg-emerald-50/30'
                    : 'border-slate-200/90'
                } ${isUnsavedModified ? 'ring-1 ring-amber-400 border-amber-400' : ''}`}
              >
                {/* 1. COMPACT 2-LINE CARD HEADER (~34px height) */}
                <div>
                  {/* Line 1: #SN badge + Full English Name on Left, Account No badge + Passbook Icon on Right */}
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-1">
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        #{cust.sn}
                      </span>
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {cust.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPassbookCustomer(cust)}
                        className="font-mono text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 active:scale-95 transition-all"
                        title="Open Customer Passbook"
                      >
                        {cust.accountNumber}
                      </button>

                      <button
                        type="button"
                        onClick={() => setPassbookCustomer(cust)}
                        className="h-6 w-6 rounded bg-slate-100 text-slate-600 hover:bg-teal-100 hover:text-teal-800 flex items-center justify-center active:scale-95 transition-all"
                        title="View Passbook & History"
                        aria-label={`Mini Passbook for ${cust.name}`}
                      >
                        <Receipt className="h-3 w-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setNumpadCustomer(cust)}
                        className="h-6 w-6 rounded bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800 flex items-center justify-center active:scale-95 transition-all"
                        title={t.daily.quickPad}
                        aria-label={`Keypad for ${cust.name}`}
                      >
                        <Calculator className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Line 2: Hindi Name on Left + Paid Pill on Right */}
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[11px] text-slate-500 font-['Noto_Sans_Devanagari'] leading-none truncate max-w-[210px] xs:max-w-[260px]">
                      {cust.nameDevanagari || '-'}
                    </span>

                    {isPaid && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.2 rounded leading-tight">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        <span>Paid</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. SMART AMOUNT INPUT & ACTION STRIP */}
                <div className="mt-2 flex items-center gap-1.5">
                  {/* Smart Amount Input (Auto-clear zero placeholder & numeric keyboard) */}
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={amount > 0 ? String(amount) : ''}
                      onChange={(e) => handleAmountChange(cust.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isZeroUnpaid) {
                          handleSaveCustomer(cust.id);
                        }
                      }}
                      placeholder={`${currency} 0`}
                      className={`h-8 w-24 text-xs font-mono font-semibold px-2 rounded border focus:ring-1 focus:ring-emerald-600 focus:outline-none bg-white text-slate-900 transition-colors ${
                        flashingCustId === cust.id
                          ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-400'
                          : isPaid
                          ? 'border-emerald-300'
                          : 'border-slate-300'
                      }`}
                    />
                    {amount > 0 && (
                      <button
                        type="button"
                        onClick={() => handleClearAmount(cust.id)}
                        className="absolute right-1.5 top-2 text-slate-400 hover:text-rose-500 text-[11px] font-bold p-0.5 leading-none"
                        aria-label="Clear amount"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Quick-add chips with smooth addition and tactile feel */}
                  <div className="flex items-center gap-1">
                    {[100, 200, 500].map((increment) => (
                      <button
                        key={increment}
                        type="button"
                        onClick={() => handleIncrement(cust.id, increment)}
                        className="h-7 px-2 text-[10px] font-medium bg-slate-100 hover:bg-emerald-50 active:bg-emerald-100 text-slate-700 rounded transition-colors active:scale-95"
                      >
                        +{increment}
                      </button>
                    ))}
                  </div>

                  {/* 3. SMART SAVE BUTTON STATES (Prevents accidental zero saves) */}
                  {(() => {
                    if (isJustSaved) {
                      return (
                        <button
                          type="button"
                          disabled
                          className="h-8 px-2.5 text-xs font-medium rounded flex items-center gap-1 ml-auto shrink-0 bg-emerald-600 text-white shadow-xs"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{language === 'hi' ? 'सेभ भयो' : 'Saved'}</span>
                        </button>
                      );
                    }

                    if (isZeroUnpaid) {
                      return (
                        <button
                          type="button"
                          disabled
                          className="h-8 px-2.5 text-xs font-medium rounded flex items-center gap-1 ml-auto shrink-0 bg-slate-200 text-slate-400 cursor-not-allowed select-none"
                          title="Enter an amount to save"
                        >
                          <Save className="h-3 w-3" />
                          <span>{language === 'hi' ? 'सेभ' : 'Save'}</span>
                        </button>
                      );
                    }

                    if (isUnsavedModified) {
                      return (
                        <button
                          type="button"
                          onClick={() => handleSaveCustomer(cust.id)}
                          className="h-8 px-2.5 text-xs font-semibold rounded flex items-center gap-1 ml-auto shrink-0 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs active:scale-95 transition-all"
                        >
                          <Save className="h-3 w-3" />
                          <span>{isAlreadyPaid ? (language === 'hi' ? 'अपडेट' : 'Update') : (language === 'hi' ? 'सेभ' : 'Save')}</span>
                        </button>
                      );
                    }

                    if (isAlreadyPaid) {
                      return (
                        <button
                          type="button"
                          onClick={() => handleSaveCustomer(cust.id)}
                          className="h-8 px-2.5 text-xs font-medium rounded flex items-center gap-1 ml-auto shrink-0 border border-emerald-600 text-emerald-700 bg-white hover:bg-emerald-50 active:scale-95 transition-all"
                        >
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>{language === 'hi' ? 'अपडेट' : 'Update'}</span>
                        </button>
                      );
                    }

                    return (
                      <button
                        type="button"
                        onClick={() => handleSaveCustomer(cust.id)}
                        className="h-8 px-2.5 text-xs font-semibold rounded flex items-center gap-1 ml-auto shrink-0 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs active:scale-95 transition-all"
                      >
                        <Save className="h-3 w-3" />
                        <span>{language === 'hi' ? 'सेभ' : 'Save'}</span>
                      </button>
                    );
                  })()}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. INTERACTIVE DATE PICKER MODAL & CALENDAR */}
      {showDatePickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-xs rounded-2xl bg-white p-4 shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                <Calendar className="h-4 w-4 text-emerald-700" />
                <span>{language === 'hi' ? 'सङ्कलन मिति छान्नुहोस्' : 'Select Collection Date'}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDatePickerModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Stepper Buttons: Today, Yesterday */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => handleApplyDateModal(todayIso)}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                  selectedDate === todayIso
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {language === 'hi' ? 'आज (Today)' : 'Today'}
              </button>
              <button
                type="button"
                onClick={() => handleApplyDateModal(yesterdayIso)}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                  selectedDate === yesterdayIso
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {language === 'hi' ? 'हिजो (Yesterday)' : 'Yesterday'}
              </button>
            </div>

            {/* Native Full Calendar Date Input */}
            <div className="space-y-1.5 mb-4">
              <label className="block text-[11px] font-bold text-slate-600">
                {language === 'hi' ? 'क्यालेन्डरबाट छान्नुहोस् वा टाइप गर्नुहोस्:' : 'Pick or Type Date (YYYY-MM-DD):'}
              </label>
              <input
                type="date"
                value={customDateInput}
                onChange={(e) => setCustomDateInput(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-mono font-bold text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDatePickerModal(false)}
                className="flex-1 rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
              >
                {language === 'hi' ? 'रद्द' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleApplyDateModal(customDateInput)}
                className="flex-1 rounded-xl bg-emerald-700 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 active:scale-95 transition-all"
              >
                {language === 'hi' ? 'लागू गर्नुहोस्' : 'Apply Date'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. CUSTOMER MINI-PASSBOOK MODAL */}
      <CustomerPassbookModal
        customer={passbookCustomer}
        isOpen={!!passbookCustomer}
        currency={currency}
        language={language}
        todayAmount={passbookCustomer ? entries[passbookCustomer.id] || 0 : 0}
        selectedDate={selectedDate}
        onClose={() => setPassbookCustomer(null)}
        onUndoTodayEntry={handleUndoCustomerToday}
        onEditTodayEntry={handleEditCustomerToday}
      />

      {/* Fast NumPad Modal */}
      <QuickNumPadModal
        isOpen={!!numpadCustomer}
        customer={numpadCustomer}
        currentAmount={numpadCustomer ? entries[numpadCustomer.id] || 0 : 0}
        currency={currency}
        selectedDate={selectedDate}
        onClose={() => setNumpadCustomer(null)}
        onSaveAmount={(cId, amt) => {
          setEntries((prev) => ({
            ...prev,
            [cId]: amt,
          }));
          handleSaveCustomer(cId);
        }}
        onNextCustomer={() => {
          if (nextCustomer) {
            setNumpadCustomer(nextCustomer);
          }
        }}
        hasNext={hasNextCustomer}
      />

      {/* Quick Saved Notification Toast */}
      {showSavedToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xl border border-slate-700 animate-fade-in">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>{t.daily.entrySavedAlert}</span>
        </div>
      )}
    </div>
  );
};

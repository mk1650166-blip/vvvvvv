/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Edit2,
  Trash2,
  Phone,
  FileText,
  History,
  X,
  AlertTriangle,
  Check,
  TrendingUp,
} from 'lucide-react';
import { Customer } from '../types/index.ts';
import { translations } from '../i18n/translations.ts';
import { filterCustomers, formatCurrency } from '../utils/calculations.ts';
import { LocalStorageManager } from '../services/storage.ts';

interface CustomerListViewProps {
  customers: Customer[];
  currency: string;
  language: 'hi' | 'en';
  onAddCustomer: (customerData: Omit<Customer, 'id' | 'sn' | 'createdAt'>) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
}

export const CustomerListView: React.FC<CustomerListViewProps> = ({
  customers,
  currency,
  language,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
}) => {
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [viewHistoryCustomer, setViewHistoryCustomer] = useState<Customer | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formNameDevanagari, setFormNameDevanagari] = useState('');
  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formError, setFormError] = useState('');

  // Filtered customer list
  const filtered = useMemo(() => {
    return filterCustomers(customers, searchQuery);
  }, [customers, searchQuery]);

  // Open add modal with auto-suggested next A/c number
  const handleOpenAdd = () => {
    const maxSn = customers.reduce((max, c) => Math.max(max, c.sn || 0), 0);
    const nextAcc = `12900${(1290 + maxSn).toString()}`;
    setFormName('');
    setFormNameDevanagari('');
    setFormAccountNumber(nextAcc);
    setFormPhone('');
    setFormNote('');
    setFormError('');
    setIsAddOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormName(c.name);
    setFormNameDevanagari(c.nameDevanagari || '');
    setFormAccountNumber(c.accountNumber);
    setFormPhone(c.phone || '');
    setFormNote(c.note || '');
    setFormError('');
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formAccountNumber.trim()) {
      setFormError(t.customers.validationError);
      return;
    }

    // Check duplicate account number
    const exists = customers.some(
      (c) => c.accountNumber.trim().toLowerCase() === formAccountNumber.trim().toLowerCase()
    );
    if (exists) {
      setFormError(t.customers.accountExistsError);
      return;
    }

    onAddCustomer({
      name: formName.trim().toUpperCase(),
      nameDevanagari: formNameDevanagari.trim(),
      accountNumber: formAccountNumber.trim(),
      phone: formPhone.trim(),
      note: formNote.trim(),
    });

    setIsAddOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    if (!formName.trim() || !formAccountNumber.trim()) {
      setFormError(t.customers.validationError);
      return;
    }

    const exists = customers.some(
      (c) =>
        c.id !== editingCustomer.id &&
        c.accountNumber.trim().toLowerCase() === formAccountNumber.trim().toLowerCase()
    );
    if (exists) {
      setFormError(t.customers.accountExistsError);
      return;
    }

    onUpdateCustomer({
      ...editingCustomer,
      name: formName.trim().toUpperCase(),
      nameDevanagari: formNameDevanagari.trim(),
      accountNumber: formAccountNumber.trim(),
      phone: formPhone.trim(),
      note: formNote.trim(),
    });

    setEditingCustomer(null);
  };

  // Customer history data
  const historyData = useMemo(() => {
    if (!viewHistoryCustomer) return [];
    return LocalStorageManager.getCustomerHistory(viewHistoryCustomer.id);
  }, [viewHistoryCustomer]);

  const currentMonth = useMemo(() => new Date().toISOString().slice(0, 7), []);

  const historyTotal = useMemo(() => {
    return historyData.reduce((sum, h) => sum + h.amount, 0);
  }, [historyData]);

  const historyMonthTotal = useMemo(() => {
    return historyData
      .filter((h) => h.date.startsWith(currentMonth))
      .reduce((sum, h) => sum + h.amount, 0);
  }, [historyData, currentMonth]);

  return (
    <div className="pb-28 pt-2">
      {/* Top Bar with Total Count and Add Button */}
      <div className="sticky top-[53px] z-20 bg-slate-100/95 backdrop-blur-sm px-3.5 py-2.5 border-b border-slate-200">
        <div className="mx-auto max-w-3xl flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-['Noto_Sans_Devanagari','Inter']">
              {t.customers.title}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t.customers.totalRegistered}: <strong className="text-teal-700">{customers.length}</strong> (Scales to 200+)
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-2xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-800 active:scale-95 transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span>{t.customers.addNew}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mx-auto max-w-3xl mt-2.5 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'hi' ? 'नाम, खाता नं., फोन वा सिरियल नं. (SN: १०२) खोज्नुहोस्...' : 'Search name, A/c, phone or S.N. (e.g. 102)...'}
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-600 focus:outline-none shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Customer List */}
      <div className="mx-auto max-w-3xl px-3.5 mt-3 space-y-2.5">
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center border border-slate-200 shadow-sm">
            <Users className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-600">
              {t.daily.noEntriesFound}
            </p>
          </div>
        ) : (
          filtered.map((cust) => (
            <div
              key={cust.id}
              className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm hover:border-slate-300 transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-xs font-bold text-teal-800 border border-teal-200 font-mono shadow-xs">
                  {cust.sn}
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">
                    {cust.name}
                  </h3>
                  {cust.nameDevanagari && (
                    <p className="text-xs font-medium text-slate-600 font-['Noto_Sans_Devanagari'] leading-tight truncate">
                      {cust.nameDevanagari}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                    <span className="font-mono font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      A/c: {cust.accountNumber}
                    </span>
                    {cust.phone && (
                      <span className="flex items-center gap-0.5 text-slate-600">
                        <Phone className="h-3 w-3 text-teal-600" />
                        {cust.phone}
                      </span>
                    )}
                    {cust.note && (
                      <span className="text-slate-400 truncate max-w-[150px]">
                        • {cust.note}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                {/* View history */}
                <button
                  type="button"
                  onClick={() => setViewHistoryCustomer(cust)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-teal-700 transition-all"
                  title="Payment History"
                  aria-label="Payment History"
                >
                  <History className="h-4 w-4" />
                </button>
                {/* Edit */}
                <button
                  type="button"
                  onClick={() => handleOpenEdit(cust)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-blue-700 transition-all"
                  title="Edit Customer"
                  aria-label="Edit Customer"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                {/* Delete */}
                <button
                  type="button"
                  onClick={() => setDeletingCustomer(cust)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
                  title="Delete Customer"
                  aria-label="Delete Customer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Customer Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 font-['Noto_Sans_Devanagari','Inter']">
                {t.customers.addNew}
              </h2>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="mt-4 space-y-3">
              {formError && (
                <div className="rounded-xl bg-rose-50 p-2.5 text-xs font-semibold text-rose-700 border border-rose-200">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.customers.name} *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. RAMESHWAR PRASAD"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 uppercase focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.customers.nameDevanagari}
                </label>
                <input
                  type="text"
                  value={formNameDevanagari}
                  onChange={(e) => setFormNameDevanagari(e.target.value)}
                  placeholder="उदा: रामेश्वर प्रसाद"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 font-['Noto_Sans_Devanagari'] focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.customers.accountNumber} *
                </label>
                <input
                  type="text"
                  required
                  value={formAccountNumber}
                  onChange={(e) => setFormAccountNumber(e.target.value)}
                  placeholder="e.g. 129001300"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono text-slate-900 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.customers.phone}
                </label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.customers.note}
                </label>
                <input
                  type="text"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="e.g. किराना पसल, चोक नजिक"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 rounded-2xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
                >
                  {t.customers.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-teal-700 py-2.5 text-xs font-bold text-white hover:bg-teal-800 shadow-md"
                >
                  {t.customers.saveCustomer}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 font-['Noto_Sans_Devanagari','Inter']">
                {t.customers.editCustomer} (A/c: {editingCustomer.accountNumber})
              </h2>
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3">
              {formError && (
                <div className="rounded-xl bg-rose-50 p-2.5 text-xs font-semibold text-rose-700 border border-rose-200">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.customers.name} *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 uppercase focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.customers.nameDevanagari}
                </label>
                <input
                  type="text"
                  value={formNameDevanagari}
                  onChange={(e) => setFormNameDevanagari(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 font-['Noto_Sans_Devanagari'] focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.customers.accountNumber} *
                </label>
                <input
                  type="text"
                  required
                  value={formAccountNumber}
                  onChange={(e) => setFormAccountNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono text-slate-900 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.customers.phone}
                </label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.customers.note}
                </label>
                <input
                  type="text"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="flex-1 rounded-2xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
                >
                  {t.customers.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-teal-700 py-2.5 text-xs font-bold text-white hover:bg-teal-800 shadow-md"
                >
                  {t.customers.saveCustomer}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Required: "Ask for confirmation before deleting") */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <h2 className="text-base font-bold text-slate-900 font-['Noto_Sans_Devanagari','Inter']">
                {t.customers.deleteConfirmTitle}
              </h2>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-['Noto_Sans_Devanagari','Inter'] mb-5">
              {t.customers.deleteConfirmMessage
                .replace('{name}', deletingCustomer.name)
                .replace('{acc}', deletingCustomer.accountNumber)}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeletingCustomer(null)}
                className="flex-1 rounded-2xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                {t.customers.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteCustomer(deletingCustomer.id);
                  setDeletingCustomer(null);
                }}
                className="flex-1 rounded-2xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 shadow-md"
              >
                {t.customers.deleteConfirmButton}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Payment History Drawer */}
      {viewHistoryCustomer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white p-5 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-700 block">
                  {t.customers.historyTitle}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {viewHistoryCustomer.name}
                </h3>
                <p className="text-xs text-slate-500">
                  A/c: <strong className="font-mono text-slate-700">{viewHistoryCustomer.accountNumber}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewHistoryCustomer(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Monthly and Lifetime Collection Summary */}
            <div className="my-3 grid grid-cols-2 gap-2 rounded-2xl bg-teal-50 p-2.5 border border-teal-200">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-teal-800 uppercase block">यस महिना ({currentMonth}):</span>
                <span className="text-base font-black text-teal-950 font-mono">
                  {formatCurrency(historyMonthTotal, currency)}
                </span>
              </div>
              <div className="min-w-0 border-l border-teal-200/80 pl-2.5">
                <span className="text-[10px] font-bold text-teal-800 uppercase block">कुल जम्मा (Lifetime):</span>
                <span className="text-base font-black text-teal-950 font-mono">
                  {formatCurrency(historyTotal, currency)}
                </span>
              </div>
            </div>

            {/* List of payments */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {historyData.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  {t.customers.noHistory}
                </div>
              ) : (
                historyData.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-200/80"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        {item.date}
                      </span>
                      {item.note && (
                        <span className="text-[10px] text-slate-500">{item.note}</span>
                      )}
                    </div>
                    <span className="text-sm font-black text-emerald-700">
                      {formatCurrency(item.amount, currency)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

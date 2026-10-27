/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, Check, Trash2 } from 'lucide-react';
import { translations } from '../i18n/translations.ts';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  language: 'hi' | 'en';
  onSaveAndProceed: () => void;
  onDiscardAndProceed: () => void;
  onCancel: () => void;
}

export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  isOpen,
  language,
  onSaveAndProceed,
  onDiscardAndProceed,
  onCancel,
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200">
        <div className="flex items-center gap-3 text-amber-600 mb-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <h2 className="text-base font-bold text-slate-900 font-['Noto_Sans_Devanagari','Inter']">
            {t.unsavedModal.title}
          </h2>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-['Noto_Sans_Devanagari','Inter'] mb-5">
          {t.unsavedModal.message}
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onSaveAndProceed}
            className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700 active:scale-95 transition-all shadow-md"
          >
            <Check className="h-4 w-4" />
            <span>{t.unsavedModal.saveAndContinue}</span>
          </button>

          <button
            type="button"
            onClick={onDiscardAndProceed}
            className="flex items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 active:scale-95 transition-all border border-rose-200"
          >
            <Trash2 className="h-4 w-4" />
            <span>{t.unsavedModal.leaveWithoutSaving}</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-all text-center"
          >
            {t.unsavedModal.stayHere}
          </button>
        </div>
      </div>
    </div>
  );
};

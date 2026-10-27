/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Delete, ShieldCheck, KeyRound } from 'lucide-react';
import { translations } from '../i18n/translations.ts';

interface PinLockScreenProps {
  correctPin: string;
  language: 'hi' | 'en';
  onUnlock: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({
  correctPin,
  language,
  onUnlock,
}) => {
  const t = translations[language];
  const [enteredPin, setEnteredPin] = useState('');
  const [isError, setIsError] = useState(false);

  const handleDigit = (digit: string) => {
    if (enteredPin.length < 4) {
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);
      setIsError(false);

      if (nextPin.length === 4) {
        if (nextPin === correctPin) {
          onUnlock();
        } else {
          setIsError(true);
          setTimeout(() => {
            setEnteredPin('');
            setIsError(false);
          }, 800);
        }
      }
    }
  };

  const handleDelete = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setIsError(false);
  };

  const handleClear = () => {
    setEnteredPin('');
    setIsError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-teal-900 via-slate-900 to-slate-950 px-6 py-10 text-white select-none">
      {/* App Branding & Icon */}
      <div className="flex flex-col items-center text-center mt-6">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-500/20 ring-2 ring-teal-400/40 shadow-xl backdrop-blur-sm">
          <Lock className="h-10 w-10 text-teal-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-['Noto_Sans_Devanagari','Inter']">
          {t.appTitle}
        </h1>
        <p className="mt-1 text-sm text-teal-200/80">
          {t.lockScreen.enterPin}
        </p>
      </div>

      {/* PIN Dots Display */}
      <div className="flex flex-col items-center my-6">
        <div className={`flex gap-5 transition-transform ${isError ? 'animate-bounce' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = enteredPin.length > index;
            return (
              <div
                key={index}
                className={`h-5 w-5 rounded-full transition-all duration-200 ${
                  isFilled
                    ? isError
                      ? 'bg-rose-500 ring-4 ring-rose-500/40 scale-110'
                      : 'bg-teal-400 ring-4 ring-teal-400/40 scale-110'
                    : 'bg-slate-700/80 ring-1 ring-slate-600'
                }`}
              />
            );
          })}
        </div>

        {isError && (
          <p className="mt-4 text-xs font-semibold text-rose-400 animate-fade-in">
            {t.lockScreen.wrongPin}
          </p>
        )}
      </div>

      {/* Large Mobile Keypad */}
      <div className="w-full max-w-xs">
        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="flex h-16 w-full items-center justify-center rounded-2xl bg-white/10 text-2xl font-semibold text-white backdrop-blur-md active:bg-teal-600 active:scale-95 transition-all shadow-md hover:bg-white/15"
              aria-label={`Digit ${digit}`}
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="flex h-16 w-full items-center justify-center rounded-2xl bg-white/5 text-sm font-medium text-slate-400 active:bg-white/15 active:scale-95 transition-all"
            aria-label="Clear PIN"
          >
            C
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="flex h-16 w-full items-center justify-center rounded-2xl bg-white/10 text-2xl font-semibold text-white backdrop-blur-md active:bg-teal-600 active:scale-95 transition-all shadow-md hover:bg-white/15"
            aria-label="Digit 0"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex h-16 w-full items-center justify-center rounded-2xl bg-white/5 text-slate-300 active:bg-white/15 active:scale-95 transition-all"
            aria-label="Backspace"
          >
            <Delete className="h-6 w-6" />
          </button>
        </div>

        {/* Quick Demo Bypass & Hint for Testing */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onUnlock}
            className="flex items-center gap-2 rounded-xl bg-teal-500/20 px-4 py-2 text-xs font-medium text-teal-300 hover:bg-teal-500/30 transition-colors border border-teal-500/30"
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>{t.lockScreen.quickUnlockDemo}</span>
          </button>
          <p className="text-[11px] text-slate-400 text-center flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-400 inline" />
            {t.lockScreen.forgotPinHint}
          </p>
        </div>
      </div>
    </div>
  );
};

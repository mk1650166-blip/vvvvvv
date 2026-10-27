/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Lock, Globe, AlertCircle, Building2, User, RefreshCw, CloudCheck, CloudOff } from 'lucide-react';
import { SyncStatus } from '../types/index.ts';
import { translations } from '../i18n/translations.ts';
import { SyncManager } from '../services/syncManager.ts';

interface HeaderProps {
  orgName: string;
  collectorName: string;
  language: 'hi' | 'en';
  onToggleLanguage: () => void;
  onLock: () => void;
  hasUnsavedChanges: boolean;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  orgName,
  collectorName,
  language,
  onToggleLanguage,
  onLock,
  hasUnsavedChanges,
  onGoHome,
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-30 h-11 bg-teal-900 text-white shadow-xs border-b border-teal-800/80 select-none">
      <div className="mx-auto flex h-full max-w-3xl items-center justify-between px-3">
        {/* Left: Interactive Brand Logo & Organization Name (Home Reset) */}
        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center gap-2 min-w-0 text-left cursor-pointer active:opacity-75 transition-opacity py-1"
          title={language === 'hi' ? 'गृहपृष्ठ (Home) - शीर्षमा फर्कनुहोस्' : 'Home - Reset to top'}
          aria-label="Home"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-800 text-teal-200 border border-teal-700/60 shadow-inner">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs font-bold text-white font-['Noto_Sans_Devanagari','Inter'] leading-tight truncate max-w-[170px] xs:max-w-[210px] sm:max-w-xs">
              {orgName || "श्री बन्धन बचत तथा ऋण सहकारी संस्था लि."}
            </h1>
            <div className="flex items-center gap-1 text-[10px] text-teal-200/80 leading-none truncate">
              <User className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{collectorName}</span>
            </div>
          </div>
        </button>

        {/* Right: Ultra-Minimal Utility Badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Unsaved indicator */}
          {hasUnsavedChanges && (
            <div
              className="flex items-center gap-0.5 rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-400/30 animate-pulse"
              title={t.header.unsaved}
            >
              <AlertCircle className="h-2.5 w-2.5 shrink-0" />
              <span>{language === 'hi' ? 'बाँकी' : 'Unsaved'}</span>
            </div>
          )}

          {/* Supabase Cloud Sync Status Badge */}
          <HeaderSyncButton language={language} />

          {/* Language Toggle Button */}
          <button
            type="button"
            onClick={onToggleLanguage}
            className="rounded bg-teal-800/80 px-1.5 py-0.5 text-[11px] font-medium text-teal-100 hover:bg-teal-700 active:scale-95 transition-all border border-teal-700/60"
            aria-label="Switch Language"
          >
            {language === 'hi' ? 'EN' : 'हिन्दी'}
          </button>

          {/* Lock Button */}
          <button
            type="button"
            onClick={onLock}
            className="flex h-7 w-7 items-center justify-center rounded bg-teal-950/60 text-teal-200 hover:bg-teal-800 active:scale-95 transition-all border border-teal-700/60"
            aria-label={t.header.lock}
            title={t.header.lock}
          >
            <Lock className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

const HeaderSyncButton: React.FC<{ language: 'hi' | 'en' }> = ({ language }) => {
  const [syncState, setSyncState] = React.useState<{
    status: SyncStatus;
    pendingCount: number;
    lastSyncedAt: string | null;
    message: string;
  }>(() => ({
    status: 'offline',
    pendingCount: 0,
    lastSyncedAt: null,
    message: '',
  }));

  React.useEffect(() => {
    return SyncManager.subscribe((state) => {
      setSyncState({
        status: state.status,
        pendingCount: state.pendingCount,
        lastSyncedAt: state.lastSyncedAt,
        message: state.message,
      });
    });
  }, []);

  const handleSyncClick = () => {
    SyncManager.syncAll();
  };

  return (
    <button
      type="button"
      onClick={handleSyncClick}
      title={`${syncState.message}${syncState.lastSyncedAt ? ' • ' + new Date(syncState.lastSyncedAt).toLocaleTimeString() : ''}`}
      className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium transition-all active:scale-95 border ${
        syncState.status === 'online' || syncState.status === 'synced'
          ? 'bg-emerald-900/60 text-emerald-200 border-emerald-600/50 hover:bg-emerald-800'
          : syncState.status === 'syncing'
          ? 'bg-blue-900/60 text-blue-200 border-blue-400/50 animate-pulse'
          : syncState.status === 'error'
          ? 'bg-rose-900/60 text-rose-200 border-rose-500/50 hover:bg-rose-800'
          : 'bg-amber-950/60 text-amber-200 border-amber-600/50 hover:bg-amber-900'
      }`}
    >
      {syncState.status === 'syncing' ? (
        <RefreshCw className="h-3 w-3 animate-spin text-blue-300" />
      ) : syncState.status === 'online' || syncState.status === 'synced' ? (
        <CloudCheck className="h-3 w-3 text-emerald-300" />
      ) : syncState.status === 'error' ? (
        <CloudOff className="h-3 w-3 text-rose-300" />
      ) : (
        <CloudOff className="h-3 w-3 text-amber-300" />
      )}
      <span className="text-[10px] hidden xs:inline font-mono">
        {syncState.status === 'online' || syncState.status === 'synced'
          ? 'Cloud'
          : syncState.status === 'syncing'
          ? 'Sync...'
          : syncState.status === 'error'
          ? 'Err'
          : 'Local'}
      </span>
      {syncState.pendingCount > 0 && (
        <span className="rounded bg-amber-400 text-slate-950 text-[9px] font-bold px-1 py-0 leading-tight">
          {syncState.pendingCount}
        </span>
      )}
    </button>
  );
};

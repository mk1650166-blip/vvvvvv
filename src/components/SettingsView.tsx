/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Shield,
  KeyRound,
  Download,
  Upload,
  RotateCcw,
  Building,
  User,
  Coins,
  Globe,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  FileCheck,
  Database,
  Cloud,
  CloudCheck,
  CloudOff,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Fingerprint,
} from 'lucide-react';
import { AppSettings, SyncStatus } from '../types/index.ts';
import { translations } from '../i18n/translations.ts';
import { LocalStorageManager } from '../services/storage.ts';
import { SyncManager } from '../services/syncManager.ts';
import {
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
  SUPABASE_SQL_SCHEMA,
  SUPABASE_RLS_FIX_SQL,
  getSupabaseClient,
  checkSupabaseHealth,
} from '../services/supabase.ts';

interface SettingsViewProps {
  settings: AppSettings;
  language: 'hi' | 'en';
  onUpdateSettings: (newSettings: AppSettings) => void;
  onDataReset: () => void;
  onDataRestored: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  language,
  onUpdateSettings,
  onDataReset,
  onDataRestored,
}) => {
  const t = translations[language];

  // Form states
  const [orgName, setOrgName] = useState(settings.orgName);
  const [officeLocation, setOfficeLocation] = useState(settings.officeLocation);
  const [collectorName, setCollectorName] = useState(settings.collectorName);
  const [currency, setCurrency] = useState<'रु' | '₹'>(settings.currency);
  const [biometricEnabled, setBiometricEnabled] = useState(Boolean(settings.biometricEnabled));
  const [autoLockMinutes, setAutoLockMinutes] = useState(settings.autoLockMinutes);

  // Backup state
  const [backupPassword, setBackupPassword] = useState('');
  const [restorePassword, setRestorePassword] = useState('');
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Save general settings
  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppSettings = {
      ...settings,
      orgName: orgName.trim(),
      officeLocation: officeLocation.trim(),
      collectorName: collectorName.trim(),
      currency,
      pinEnabled: false,
      biometricEnabled,
      autoLockMinutes,
    };
    onUpdateSettings(updated);
    LocalStorageManager.saveSettings(updated);
    setToastMessage(t.settings.settingsSaved);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Export backup
  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const { data, filename } = await LocalStorageManager.exportBackup(backupPassword);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      setToastMessage('Backup file downloaded successfully!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e: any) {
      setToastMessage('Export failed: ' + (e?.message || 'Unknown error'));
    } finally {
      setIsExporting(false);
    }
  };

  // Restore backup
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      try {
        setRestoreError(null);
        const res = await LocalStorageManager.restoreBackup(content, restorePassword);
        setToastMessage(`Restored ${res.customerCount} customers across ${res.collectionDays} daily records!`);
        onDataRestored();
        setTimeout(() => setToastMessage(null), 3500);
      } catch (err: any) {
        setRestoreError(err?.message || 'Restore failed. Invalid format or password.');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleResetConfirmed = () => {
    LocalStorageManager.resetToSeedData();
    setShowResetConfirm(false);
    onDataReset();
    setToastMessage(t.settings.resetDone);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="pb-32 pt-2">
      <div className="mx-auto max-w-3xl px-3.5 space-y-4">
        {/* Offline Security Card Banner */}
        <div className="rounded-2xl bg-teal-900 p-4 text-white shadow-md border border-teal-800">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700/60 text-teal-300">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight font-['Noto_Sans_Devanagari','Inter']">
                100% Offline & Private (फोनमै सुरक्षित)
              </h2>
              <p className="mt-1 text-xs text-teal-200/90 leading-relaxed font-['Noto_Sans_Devanagari','Inter']">
                {t.settings.offlineNotice}
              </p>
            </div>
          </div>
        </div>

        {/* Organization / Society Settings */}
        <div className="rounded-3xl bg-white p-4 sm:p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4 text-teal-800">
            <Building className="h-5 w-5 text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900 font-['Noto_Sans_Devanagari','Inter']">
              {t.settings.orgDetails}
            </h2>
          </div>

          <form onSubmit={handleSaveGeneral} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.settings.orgName}
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.settings.officeLocation}
              </label>
              <input
                type="text"
                value={officeLocation}
                onChange={(e) => setOfficeLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.settings.collectorName}
                </label>
                <input
                  type="text"
                  value={collectorName}
                  onChange={(e) => setCollectorName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.settings.currency}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrency('रु')}
                    className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all border ${
                      currency === 'रु'
                        ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    रु (Nepali Rupee)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('₹')}
                    className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all border ${
                      currency === '₹'
                        ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    ₹ (Indian Rupee)
                  </button>
                </div>
              </div>
            </div>

            {/* Auto Lock Duration */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.settings.autoLockTitle}
              </label>
              <select
                value={autoLockMinutes}
                onChange={(e) => setAutoLockMinutes(parseInt(e.target.value, 10))}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 bg-white focus:border-teal-600 focus:outline-none"
              >
                <option value={1}>{t.settings.autoLock1Min}</option>
                <option value={5}>{t.settings.autoLock5Min}</option>
                <option value={15}>After 15 Minutes</option>
                <option value={0}>{t.settings.autoLockNever}</option>
              </select>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-2xl bg-teal-700 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-800 active:scale-95 transition-all"
            >
              {t.settings.saveSettings}
            </button>
          </form>
        </div>

        {/* Supabase Cloud Backend & Sync Management */}
        <SupabaseSettingsCard
          settings={settings}
          language={language}
          onUpdateSettings={onUpdateSettings}
          onShowToast={(msg) => {
            setToastMessage(msg);
            setTimeout(() => setToastMessage(null), 3000);
          }}
        />

        {/* App Lock (Fingerprint / Screen Lock) */}
        <div className="rounded-3xl bg-white p-4 sm:p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div className="flex items-center gap-3 text-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
                <Fingerprint className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-['Noto_Sans_Devanagari','Inter']">
                  App Lock (Fingerprint / Screen Lock)
                </h2>
                <p className="text-[11px] text-slate-500">
                  {biometricEnabled
                    ? 'Device biometric / screen lock will be prompted on app startup.'
                    : 'App opens directly without asking for lock or PIN.'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={biometricEnabled}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  setBiometricEnabled(enabled);
                  const updated: AppSettings = { ...settings, biometricEnabled: enabled, pinEnabled: false };
                  onUpdateSettings(updated);
                  LocalStorageManager.saveSettings(updated);
                  setToastMessage(enabled ? 'Fingerprint / Biometric Lock enabled' : 'App Lock turned off');
                  setTimeout(() => setToastMessage(null), 2500);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
          <div className="rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-500 border border-slate-100 flex items-center gap-2">
            <span className="font-semibold text-slate-700">Mobile Security:</span>
            <span>Uses your phone's built-in fingerprint reader, Face Unlock, or screen lock PIN. Can be disabled anytime.</span>
          </div>
        </div>

        {/* Encrypted Backup & Restore */}
        <div className="rounded-3xl bg-white p-4 sm:p-5 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-teal-800">
            <Download className="h-5 w-5 text-teal-700" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-['Noto_Sans_Devanagari','Inter']">
                {t.settings.backupSection}
              </h2>
              <p className="text-[11px] text-slate-500 font-['Noto_Sans_Devanagari','Inter']">
                {t.settings.exportDesc}
              </p>
            </div>
          </div>

          {/* Export Box */}
          <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-800 mb-1">
              {t.settings.exportBackup}
            </h4>
            <p className="text-[11px] text-slate-500 mb-2.5">
              Enter an optional password to encrypt your backup file with AES-GCM:
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={backupPassword}
                onChange={(e) => setBackupPassword(e.target.value)}
                placeholder="Optional backup encryption password"
                className="flex-1 rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-800 focus:border-teal-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleExportBackup}
                disabled={isExporting}
                className="flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-800 active:scale-95 transition-all shrink-0"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Restore Box */}
          <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-800 mb-1">
              {t.settings.importBackup}
            </h4>
            <p className="text-[11px] text-slate-500 mb-2.5">
              Select an exported backup file (.json or .enc) to restore:
            </p>

            {restoreError && (
              <div className="mb-2 rounded-xl bg-rose-50 p-2 text-xs font-semibold text-rose-700 border border-rose-200">
                {restoreError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="password"
                value={restorePassword}
                onChange={(e) => setRestorePassword(e.target.value)}
                placeholder="Password if file was encrypted"
                className="flex-1 rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-800 focus:border-teal-600 focus:outline-none"
              />
              <label className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900 cursor-pointer active:scale-95 transition-all shrink-0">
                <Upload className="h-3.5 w-3.5" />
                <span>Choose File & Restore</span>
                <input
                  type="file"
                  accept=".json,.enc"
                  onChange={handleRestoreFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Factory Reset */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-rose-700">
                {t.settings.resetData}
              </h4>
              <p className="text-[11px] text-slate-500">
                Revert back to the 85 customers from the original collection sheet
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 active:scale-95 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                {t.settings.resetConfirmTitle}
              </h2>
            </div>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed font-['Noto_Sans_Devanagari','Inter']">
              {t.settings.resetConfirmMessage}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 rounded-2xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                {t.customers.cancel}
              </button>
              <button
                type="button"
                onClick={handleResetConfirmed}
                className="flex-1 rounded-2xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 shadow-md"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-2xl animate-fade-in border border-slate-700">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

interface SupabaseSettingsCardProps {
  settings: AppSettings;
  language: 'hi' | 'en';
  onUpdateSettings: (newSettings: AppSettings) => void;
  onShowToast: (msg: string) => void;
}

const SupabaseSettingsCard: React.FC<SupabaseSettingsCardProps> = ({
  settings,
  language,
  onUpdateSettings,
  onShowToast,
}) => {
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabase?.url || DEFAULT_SUPABASE_URL);
  const [supabaseKey, setSupabaseKey] = useState(settings.supabase?.anonKey || DEFAULT_SUPABASE_ANON_KEY);
  const [autoSync, setAutoSync] = useState(settings.supabase?.autoSync ?? true);
  const [showSql, setShowSql] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showRlsFix, setShowRlsFix] = useState(false);
  const [copiedRlsSql, setCopiedRlsSql] = useState(false);
  const [showFlutterGuide, setShowFlutterGuide] = useState(false);
  const [copiedFlutter, setCopiedFlutter] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [syncState, setSyncState] = useState<{
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
      setIsSyncing(state.status === 'syncing');
    });
  }, []);

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = supabaseUrl.trim();
    const cleanKey = supabaseKey.trim();

    const updated: AppSettings = {
      ...settings,
      supabase: {
        url: cleanUrl,
        anonKey: cleanKey,
        autoSync,
        lastSyncedAt: syncState.lastSyncedAt || undefined,
      },
    };

    onUpdateSettings(updated);
    // Reinitialize client with new credentials
    getSupabaseClient(cleanUrl, cleanKey);
    onShowToast(language === 'hi' ? 'Supabase विवरण सुरक्षित गरियो!' : 'Supabase credentials saved!');
    // Trigger sync
    SyncManager.syncAll();
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    const res = await SyncManager.syncAll();
    setIsSyncing(false);
    onShowToast(res.message);
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopiedSql(true);
      onShowToast(language === 'hi' ? 'SQL कपी भयो!' : 'SQL schema copied to clipboard!');
      setTimeout(() => setCopiedSql(false), 3000);
    } catch (e) {
      onShowToast('Could not copy automatically. Please select and copy text.');
    }
  };

  const handleCopyRlsSql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_RLS_FIX_SQL);
      setCopiedRlsSql(true);
      onShowToast(language === 'hi' ? 'RLS समाधान SQL कपी भयो!' : 'RLS Fix SQL copied to clipboard!');
      setTimeout(() => setCopiedRlsSql(false), 3000);
    } catch (e) {
      onShowToast('Could not copy automatically. Please select and copy text.');
    }
  };

  return (
    <div className="rounded-3xl bg-white p-4 sm:p-5 shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2 text-emerald-800">
          <Database className="h-5 w-5 text-emerald-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-['Noto_Sans_Devanagari','Inter']">
              {language === 'hi' ? 'Supabase क्लाउड ब्याकइन्ड' : 'Supabase Cloud Backend'}
            </h2>
            <p className="text-[11px] text-slate-500 font-normal">
              {language === 'hi' ? 'क्लाउड डेटा सिङ्क र अफलाइन ब्याकअप' : 'Cloud data sync & offline fallback'}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border ${
              syncState.status === 'online' || syncState.status === 'synced'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : syncState.status === 'syncing'
                ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                : syncState.status === 'error'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {syncState.status === 'online' || syncState.status === 'synced' ? (
              <CloudCheck className="h-3.5 w-3.5 text-emerald-600" />
            ) : syncState.status === 'syncing' ? (
              <RefreshCw className="h-3.5 w-3.5 text-blue-600 animate-spin" />
            ) : syncState.status === 'error' ? (
              <CloudOff className="h-3.5 w-3.5 text-rose-600" />
            ) : (
              <CloudOff className="h-3.5 w-3.5 text-amber-600" />
            )}
            <span>
              {syncState.status === 'online' || syncState.status === 'synced'
                ? (language === 'hi' ? 'अनलाइन (Online)' : 'Online')
                : syncState.status === 'syncing'
                ? (language === 'hi' ? 'सिङ्क हुँदैछ...' : 'Syncing...')
                : syncState.status === 'error'
                ? (language === 'hi' ? 'त्रुटि' : 'Error')
                : (language === 'hi' ? 'अफलाइन क्यास' : 'Offline Mode')}
            </span>
          </span>
        </div>
      </div>

      {/* Sync Status Banner */}
      <div className="mb-4 rounded-2xl bg-slate-50 p-3 border border-slate-200/80 text-xs">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="font-semibold text-slate-800 leading-snug">
              {syncState.message}
            </p>
            {syncState.lastSyncedAt && (
              <p className="text-[11px] text-slate-500">
                {language === 'hi' ? 'अन्तिम सफल सिङ्क: ' : 'Last Synced: '}
                <span className="font-medium text-slate-700">
                  {new Date(syncState.lastSyncedAt).toLocaleString()}
                </span>
              </p>
            )}
            {syncState.pendingCount > 0 && (
              <p className="text-[11px] font-bold text-amber-700">
                ⏳ {syncState.pendingCount} {language === 'hi' ? 'वटा परिवर्तन क्लाउडमा पठाउन बाँकी छ (अफलाइन सुरक्षित)' : 'pending changes queued locally'}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="shrink-0 flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 active:scale-95 disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{language === 'hi' ? 'अहिले सिङ्क गर्नुहोस्' : 'Sync Now'}</span>
          </button>
        </div>

        {/* Highlighted RLS Error 42501 Help Banner if policy is blocking inserts */}
        {(syncState.message.includes('RLS') || syncState.message.includes('42501') || syncState.message.includes('नीति') || syncState.status === 'error') && (
          <div className="mt-3 rounded-xl bg-rose-50 p-2.5 border border-rose-200 text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
              <div className="text-[11px] leading-tight font-medium">
                <span className="font-bold text-rose-700">Error 42501 (RLS Policy):</span>{' '}
                {language === 'hi'
                  ? 'Supabase मा RLS नीति समाधान गर्न यो SQL चलाउनुहोस्:'
                  : 'Run RLS Fix SQL in Supabase SQL Editor to allow cloud writes:'}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyRlsSql}
              className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-rose-700 active:scale-95 transition-all"
            >
              {copiedRlsSql ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span>{copiedRlsSql ? 'SQL कपी भयो!' : 'Copy RLS Fix SQL'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Credentials Form */}
      <form onSubmit={handleSaveCredentials} className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Supabase Project URL
          </label>
          <input
            type="text"
            value={supabaseUrl}
            onChange={(e) => setSupabaseUrl(e.target.value)}
            placeholder="https://your-project.supabase.co"
            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-none bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Supabase Anon / Publishable Key
          </label>
          <input
            type="text"
            value={supabaseKey}
            onChange={(e) => setSupabaseKey(e.target.value)}
            placeholder="sb_publishable_..."
            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-none bg-white truncate"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-xs font-bold text-slate-700">
              {language === 'hi' ? 'स्वचालित क्लाउड सिङ्क (Auto Sync)' : 'Auto-sync on entry save'}
            </span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                setIsSyncing(true);
                const testClient = getSupabaseClient(supabaseUrl.trim(), supabaseKey.trim());
                const res = await checkSupabaseHealth(testClient);
                setIsSyncing(false);
                onShowToast(res.message);
                setSyncState((prev) => ({
                  ...prev,
                  status: res.canConnect ? (res.tablesExist ? 'synced' : 'error') : 'offline',
                  message: res.message + (res.diagnostics ? ` [${res.diagnostics}]` : ''),
                }));
              }}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
            >
              {language === 'hi' ? 'जडान परीक्षण (Test)' : 'Test Connection'}
            </button>
            <button
              type="submit"
              className="rounded-xl border border-emerald-700 bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 active:scale-95 transition-all shadow-sm"
            >
              {language === 'hi' ? 'क्रेडेन्सियल सेभ गर्नुहोस्' : 'Save Credentials'}
            </button>
          </div>
        </div>
      </form>

      {/* Supabase Paused / Timeout Troubleshooting Help Banner */}
      <div className="mt-3 rounded-2xl bg-amber-50 p-3 border border-amber-200/80 text-xs text-amber-900 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>{language === 'hi' ? 'Supabase जडान र Timeout समस्या समाधान (Troubleshooting)' : 'Supabase Connection & Timeout Troubleshooting'}</span>
        </div>
        <p className="text-[11px] text-amber-800 leading-relaxed">
          {language === 'hi'
            ? '१. Supabase Free Tier मा ७ दिन प्रयोग नभए परियोजना स्वतः Paused (निष्क्रिय) हुन्छ। यदि Timeout वा DNS त्रुटि आएमा Supabase Dashboard मा गएर "Restore Project" थिच्नुहोस्।'
            : '1. Supabase Free Tier projects pause automatically after 7 days of inactivity. If you see Timeout or DNS error, visit Supabase Dashboard and click "Restore Project".'}
        </p>
        <p className="text-[11px] text-amber-800 leading-relaxed">
          {language === 'hi'
            ? '२. जबसम्म Supabase सक्रिय हुँदैन, एप पूर्ण रूपमा स्थानीय अफलाइन क्यासमा चल्छ र कुनै डेटा हराउँदैन। जडान हुनासाथ सबै रेकर्ड स्वतः सिङ्क हुनेछ।'
            : '2. While offline or connecting, the app runs 100% on local offline storage. No data is lost and all pending entries sync automatically once reachable.'}
        </p>
        <div className="pt-1 flex items-center justify-between">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-900 underline"
          >
            <span>Supabase Dashboard खोल्नुहोस्</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <button
            type="button"
            onClick={() => {
              setSupabaseUrl(DEFAULT_SUPABASE_URL);
              setSupabaseKey(DEFAULT_SUPABASE_ANON_KEY);
              onShowToast('डिफल्ट क्रेडिन्सियल रिसेट भयो!');
            }}
            className="text-[11px] text-slate-500 hover:text-slate-800 underline"
          >
            {language === 'hi' ? 'डिफल्ट रिसेट' : 'Reset Defaults'}
          </button>
        </div>
      </div>

      {/* Collapsible SQL Schema Helper */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowSql(!showSql)}
          className="flex w-full items-center justify-between text-left text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-emerald-600" />
            <span>
              {language === 'hi'
                ? 'Supabase SQL तालिका संरचना (Schema DDL)'
                : 'Supabase SQL Table Schema DDL'}
            </span>
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold underline">
            {showSql ? (language === 'hi' ? 'लुकाउनुहोस्' : 'Hide') : (language === 'hi' ? 'देखाउनुहोस्' : 'View SQL')}
          </span>
        </button>

        {showSql && (
          <div className="mt-2.5 space-y-2 rounded-2xl bg-slate-900 p-3 text-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[11px] text-slate-400">
                {language === 'hi'
                  ? 'Supabase Dashboard > SQL Editor मा पेस्ट गरी Run गर्नुहोस्:'
                  : 'Paste & Run in Supabase Dashboard > SQL Editor:'}
              </span>
              <button
                type="button"
                onClick={handleCopySql}
                className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-500 active:scale-95 transition-all shadow-sm"
              >
                {copiedSql ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copiedSql ? (language === 'hi' ? 'कपी भयो!' : 'Copied!') : (language === 'hi' ? 'SQL कपी गर्नुहोस्' : 'Copy SQL')}</span>
              </button>
            </div>
            <pre className="max-h-48 overflow-y-auto font-mono text-[10px] text-emerald-300 whitespace-pre leading-relaxed select-all">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        )}
      </div>

      {/* Collapsible RLS Policy Fix (Error 42501) Helper */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowRlsFix(!showRlsFix)}
          className="flex w-full items-center justify-between text-left text-xs font-bold text-slate-700 hover:text-rose-700 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
            <span>
              {language === 'hi'
                ? 'Supabase RLS नीति समाधान (Fix Error 42501 SQL)'
                : 'Supabase RLS Policy Fix (Fix Error 42501 SQL)'}
            </span>
          </span>
          <span className="text-[11px] text-rose-700 font-semibold underline">
            {showRlsFix ? (language === 'hi' ? 'लुकाउनुहोस्' : 'Hide') : (language === 'hi' ? 'RLS फिक्स हेर्नुहोस्' : 'View RLS Fix')}
          </span>
        </button>

        {showRlsFix && (
          <div className="mt-2.5 space-y-2 rounded-2xl bg-slate-900 p-3 text-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[11px] text-rose-300 font-medium">
                {language === 'hi'
                  ? 'Error 42501 समाधान गर्न यो SQL Supabase SQL Editor मा चलाउनुहोस्:'
                  : 'Run this in Supabase SQL Editor to resolve error 42501:'}
              </span>
              <button
                type="button"
                onClick={handleCopyRlsSql}
                className="flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-rose-500 active:scale-95 transition-all shadow-sm"
              >
                {copiedRlsSql ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copiedRlsSql ? (language === 'hi' ? 'कपी भयो!' : 'Copied!') : (language === 'hi' ? 'RLS SQL कपी' : 'Copy RLS Fix')}</span>
              </button>
            </div>
            <pre className="max-h-48 overflow-y-auto font-mono text-[10px] text-rose-200 whitespace-pre leading-relaxed select-all">
              {SUPABASE_RLS_FIX_SQL}
            </pre>
          </div>
        )}
      </div>

      {/* Flutter App Integration & Sync Troubleshooting Section */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowFlutterGuide(!showFlutterGuide)}
          className="flex w-full items-center justify-between text-left text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
            <span>
              {language === 'hi'
                ? 'Flutter App सिङ्क गाइड र कपी-पेस्ट कोड (Flutter Guide)'
                : 'Flutter App Sync Guide & Code Snippet'}
            </span>
          </span>
          <span className="text-[11px] text-blue-700 font-semibold underline">
            {showFlutterGuide ? (language === 'hi' ? 'लुकाउनुहोस्' : 'Hide') : (language === 'hi' ? 'हेर्नुहोस्' : 'View Code')}
          </span>
        </button>

        {showFlutterGuide && (
          <div className="mt-2.5 space-y-2.5 rounded-2xl bg-slate-900 p-3 text-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[11px] text-blue-300 font-bold">
                {language === 'hi'
                  ? 'Flutter मा Customer Upsert गर्ने सही तरिका:'
                  : 'Correct Flutter Customer Upsert Code:'}
              </span>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(`// Flutter (supabase_flutter) Customer Sync
await Supabase.instance.client.from('customers').upsert({
  'id': customer.id, // e.g. 'c_' + DateTime.now().millisecondsSinceEpoch.toString()
  'sn': customer.sn, // must be int (e.g. 280), NOT String
  'name': customer.name,
  'name_devanagari': customer.nameDevanagari,
  'account_number': customer.accountNumber,
  'phone': customer.phone,
  'note': customer.note ?? '',
  'updated_at': DateTime.now().toIso8601String(),
}, onConflict: 'id');`);
                    setCopiedFlutter(true);
                    onShowToast('Flutter कोड कपी भयो!');
                    setTimeout(() => setCopiedFlutter(false), 3000);
                  } catch (e) {
                    onShowToast('Could not copy.');
                  }
                }}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-500 active:scale-95 transition-all shadow-sm"
              >
                {copiedFlutter ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copiedFlutter ? 'कपी भयो!' : 'Dart कोड कपी'}</span>
              </button>
            </div>
            <pre className="max-h-48 overflow-y-auto font-mono text-[10px] text-blue-200 whitespace-pre leading-relaxed select-all">
{`// 1. Flutter dependencies in pubspec.yaml:
// supabase_flutter: ^2.8.0

// 2. Exact upsert method in Flutter:
Future<void> syncCustomerToSupabase(CustomerModel customer) async {
  try {
    await Supabase.instance.client.from('customers').upsert({
      'id': customer.id, // e.g. 'c_1729837492'
      'sn': customer.sn, // MUST be an int, not String!
      'name': customer.name,
      'name_devanagari': customer.nameDevanagari,
      'account_number': customer.accountNumber,
      'phone': customer.phone,
      'note': customer.note ?? '',
      'updated_at': DateTime.now().toIso8601String(),
    }, onConflict: 'id');
    print('Customer synced to Supabase successfully!');
  } on PostgrestException catch (error) {
    print('Supabase error: \${error.message}, code: \${error.code}');
  }
}`}
            </pre>
            <div className="border-t border-slate-800 pt-2 text-[11px] text-slate-300 space-y-1">
              <p className="font-bold text-amber-300">
                {language === 'hi' ? '📌 Flutter मा डेटा अड्किने मुख्य ३ कारण र समाधान:' : '📌 3 Common Reasons for Stuck Sync in Flutter:'}
              </p>
              <p>1. <b>Data Type Mismatch:</b> <code>sn</code> लाई <code>String</code> पठाएमा Postgres ले इन्सर्ट रोक्छ। Flutter मा <code>int.tryParse(...)</code> प्रयोग गर्नुहोस्।</p>
              <p>2. <b>Conflict Strategy:</b> <code>.upsert(data, onConflict: 'id')</code> नराखी <code>.insert()</code> गर्दा डुप्लिकेट आईडीमा रोकिन्छ।</p>
              <p>3. <b>RLS Policies:</b> Supabase Table Editor मा गएर 'Enable insert/update for anon' पोलिसी सक्रिय हुनुपर्छ।</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

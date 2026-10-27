/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, AppSettings, Customer } from './types/index.ts';
import { LocalStorageManager } from './services/storage.ts';
import { SyncManager } from './services/syncManager.ts';
import { Header } from './components/Header.tsx';
import { Navigation } from './components/Navigation.tsx';
import { BiometricLockScreen } from './components/BiometricLockScreen.tsx';
import { DailyEntryView } from './components/DailyEntryView.tsx';
import { CustomerListView } from './components/CustomerListView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { UnsavedChangesDialog } from './components/UnsavedChangesDialog.tsx';

export default function App() {
  // Check if ?autostart=1 query param is set (ultra-mode testability requirement)
  const isAutoStart = new URLSearchParams(window.location.search).get('autostart') === '1';

  // App settings state
  const [settings, setSettings] = useState<AppSettings>(() => LocalStorageManager.getSettings());
  // Customer list state
  const [customers, setCustomers] = useState<Customer[]>(() => LocalStorageManager.getCustomers());
  // Current active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('daily');

  // React to SyncManager cloud events
  useEffect(() => {
    return SyncManager.subscribe((syncState) => {
      if (syncState.status === 'synced') {
        const freshCustomers = LocalStorageManager.getCustomers();
        const freshSettings = LocalStorageManager.getSettings();
        setCustomers(freshCustomers);
        setSettings(freshSettings);
      }
    });
  }, []);

  // Security Lock state (Only active if biometricEnabled is ON in settings)
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    if (isAutoStart) return false;
    const initialSettings = LocalStorageManager.getSettings();
    if (!initialSettings.biometricEnabled) return false;
    return !LocalStorageManager.isSessionUnlocked(initialSettings.autoLockMinutes || 5);
  });

  // Unsaved changes state from DailyEntry
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [pendingTab, setPendingTab] = useState<ActiveTab | null>(null);
  const [homeResetTrigger, setHomeResetTrigger] = useState<number>(0);

  const handleGoHome = useCallback(() => {
    setActiveTab('daily');
    setHomeResetTrigger((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Sync session unlocked state
  const handleUnlock = useCallback(() => {
    LocalStorageManager.markUnlocked();
    setIsLocked(false);
  }, []);

  const handleLock = useCallback(() => {
    LocalStorageManager.lockNow();
    setIsLocked(true);
  }, []);

  // Language toggle handler
  const handleToggleLanguage = useCallback(() => {
    const nextLang = settings.language === 'hi' ? 'en' : 'hi';
    const updated = { ...settings, language: nextLang as 'hi' | 'en' };
    setSettings(updated);
    LocalStorageManager.saveSettings(updated);
  }, [settings]);

  // Tab change with unsaved protection
  const handleTabChange = useCallback((newTab: ActiveTab) => {
    if (newTab === activeTab) {
      if (newTab === 'daily') {
        handleGoHome();
      }
      return;
    }
    if (activeTab === 'daily' && hasUnsavedChanges) {
      setPendingTab(newTab);
    } else {
      setActiveTab(newTab);
      if (newTab === 'daily') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [activeTab, hasUnsavedChanges, handleGoHome]);

  // Customer handlers
  const handleAddCustomer = useCallback((customerData: Omit<Customer, 'id' | 'sn' | 'createdAt'>) => {
    const added = LocalStorageManager.addCustomer(customerData);
    setCustomers(LocalStorageManager.getCustomers());
  }, []);

  const handleUpdateCustomer = useCallback((updatedCustomer: Customer) => {
    LocalStorageManager.updateCustomer(updatedCustomer);
    setCustomers(LocalStorageManager.getCustomers());
  }, []);

  const handleDeleteCustomer = useCallback((customerId: string) => {
    LocalStorageManager.deleteCustomer(customerId);
    setCustomers(LocalStorageManager.getCustomers());
  }, []);

  // Settings update
  const handleUpdateSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    LocalStorageManager.saveSettings(newSettings);
  }, []);

  // Data reset / restore
  const handleDataReload = useCallback(() => {
    setSettings(LocalStorageManager.getSettings());
    setCustomers(LocalStorageManager.getCustomers());
  }, []);

  // Visibility change auto-lock detection (when phone screen turns off or app is backgrounded)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && settings.biometricEnabled && settings.autoLockMinutes === 1) {
        handleLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [settings.biometricEnabled, settings.autoLockMinutes, handleLock]);

  // If locked, render Biometric Screen
  if (isLocked && settings.biometricEnabled) {
    return (
      <BiometricLockScreen
        language={settings.language}
        onUnlock={handleUnlock}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased selection:bg-emerald-600 selection:text-white">
      {/* Top Header */}
      <Header
        orgName={settings.orgName}
        collectorName={settings.collectorName}
        language={settings.language}
        onToggleLanguage={handleToggleLanguage}
        onLock={handleLock}
        hasUnsavedChanges={hasUnsavedChanges}
        onGoHome={handleGoHome}
      />

      {/* Main Content View Container */}
      <main className="mx-auto max-w-3xl">
        {activeTab === 'daily' && (
          <DailyEntryView
            customers={customers}
            currency={settings.currency}
            language={settings.language}
            onUnsavedStateChange={setHasUnsavedChanges}
            onRequestDateChangePrompt={(targetDate) => {
              if (hasUnsavedChanges) {
                return false;
              }
              return true;
            }}
            resetTrigger={homeResetTrigger}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerListView
            customers={customers}
            currency={settings.currency}
            language={settings.language}
            onAddCustomer={handleAddCustomer}
            onUpdateCustomer={handleUpdateCustomer}
            onDeleteCustomer={handleDeleteCustomer}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            customers={customers}
            currency={settings.currency}
            language={settings.language}
            orgName={settings.orgName}
            officeLocation={settings.officeLocation}
            collectorName={settings.collectorName}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            language={settings.language}
            onUpdateSettings={handleUpdateSettings}
            onDataReset={handleDataReload}
            onDataRestored={handleDataReload}
          />
        )}
      </main>

      {/* Bottom Thumb Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        language={settings.language}
      />

      {/* Unsaved Changes Confirmation Modal */}
      <UnsavedChangesDialog
        isOpen={!!pendingTab}
        language={settings.language}
        onSaveAndProceed={() => {
          // Trigger save by resetting unsaved state and navigating
          setHasUnsavedChanges(false);
          if (pendingTab) setActiveTab(pendingTab);
          setPendingTab(null);
        }}
        onDiscardAndProceed={() => {
          setHasUnsavedChanges(false);
          if (pendingTab) setActiveTab(pendingTab);
          setPendingTab(null);
        }}
        onCancel={() => {
          setPendingTab(null);
        }}
      />
    </div>
  );
}

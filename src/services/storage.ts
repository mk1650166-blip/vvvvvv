/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppSettings, BackupExportData, Customer, DailyCollectionRecord } from '../types/index.ts';
import { encryptData, decryptData } from './crypto.ts';
import { DEFAULT_SETTINGS, INITIAL_CUSTOMERS, INITIAL_COLLECTIONS } from './seedData.ts';
import { SyncManager } from './syncManager.ts';
import { calculateCustomerCollections, CustomerCollectionSummary } from '../utils/calculations.ts';

const SETTINGS_KEY = 'pigmy_settings_v1';
const CUSTOMERS_KEY = 'pigmy_customers_v1';
const COLLECTIONS_KEY = 'pigmy_collections_v1';
const LOCK_STATE_KEY = 'pigmy_lock_unlocked_time';

export class LocalStorageManager {
  // Settings
  static getSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          pinEnabled: false, // Completely remove custom numeric PIN
          biometricEnabled: Boolean(parsed.biometricEnabled),
        };
      }
    } catch (e) {
      console.warn('Failed to parse settings from storage', e);
    }
    this.saveSettings(DEFAULT_SETTINGS, false);
    return DEFAULT_SETTINGS;
  }

  static saveSettings(settings: AppSettings, syncCloud: boolean = false): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    if (syncCloud) {
      try {
        SyncManager.queueAction('update_settings', settings);
      } catch (e) {
        // Fallback silently
      }
    }
  }

  // Customers
  static getCustomers(): Customer[] {
    try {
      const stored = localStorage.getItem(CUSTOMERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize permanent sn so every customer strictly starts from 1 and increments sequentially with NO skips
          return parsed.map((c: Customer, idx: number) => ({
            ...c,
            sn: idx + 1,
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to parse customers from storage', e);
    }
    const initialWithNormalizedSn = INITIAL_CUSTOMERS.map((c, idx) => ({
      ...c,
      sn: idx + 1,
    }));
    this.saveCustomers(initialWithNormalizedSn);
    return initialWithNormalizedSn;
  }

  static saveCustomers(customers: Customer[], syncCloud: boolean = false): void {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  }

  static addCustomer(customerData: Omit<Customer, 'id' | 'sn' | 'createdAt'>): Customer {
    const customers = this.getCustomers();
    const newCustomer: Customer = {
      ...customerData,
      id: 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      sn: customers.length + 1,
      createdAt: new Date().toISOString(),
    };
    customers.push(newCustomer);
    this.saveCustomers(customers);
    try {
      SyncManager.queueAction('insert_customer', newCustomer);
    } catch (e) {
      // Fallback
    }
    return newCustomer;
  }

  static updateCustomer(updatedCustomer: Customer): void {
    const customers = this.getCustomers();
    const idx = customers.findIndex((c) => c.id === updatedCustomer.id);
    if (idx !== -1) {
      customers[idx] = updatedCustomer;
      this.saveCustomers(customers);
      try {
        SyncManager.queueAction('update_customer', updatedCustomer);
      } catch (e) {
        // Fallback
      }
    }
  }

  static deleteCustomer(customerId: string): void {
    const customers = this.getCustomers();
    const filtered = customers
      .filter((c) => c.id !== customerId)
      .map((c, idx) => ({ ...c, sn: idx + 1 }));
    this.saveCustomers(filtered);
    try {
      SyncManager.queueAction('delete_customer', { id: customerId });
    } catch (e) {
      // Fallback
    }
  }

  // Customer collection stats (lifetime total and active month total)
  static getCustomerCollectionSummary(customerId: string, referenceDate?: string): CustomerCollectionSummary {
    const all = this.getAllCollections();
    return calculateCustomerCollections(all, customerId, referenceDate);
  }

  // Collections
  static getAllCollections(): Record<string, DailyCollectionRecord> {
    try {
      const stored = localStorage.getItem(COLLECTIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse collections from storage', e);
    }
    this.saveAllCollections(INITIAL_COLLECTIONS);
    return INITIAL_COLLECTIONS;
  }

  // Alias for SyncManager consistency
  static getCollections(): Record<string, DailyCollectionRecord> {
    return this.getAllCollections();
  }

  static saveAllCollections(collections: Record<string, DailyCollectionRecord>): void {
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  }

  // Alias for SyncManager consistency
  static saveCollections(collections: Record<string, DailyCollectionRecord>): void {
    this.saveAllCollections(collections);
  }

  static getDailyRecord(date: string): DailyCollectionRecord {
    const all = this.getAllCollections();
    if (all[date]) {
      return all[date];
    }
    return {
      date,
      entries: {},
      notes: {},
      updatedAt: new Date().toISOString(),
    };
  }

  static saveDailyRecord(record: DailyCollectionRecord, syncCloud: boolean = true): void {
    const all = this.getAllCollections();
    all[record.date] = {
      ...record,
      updatedAt: new Date().toISOString(),
    };
    this.saveAllCollections(all);
    if (syncCloud) {
      try {
        SyncManager.queueAction('save_collection', all[record.date]);
      } catch (e) {
        // Fallback
      }
    }
  }

  static getCustomerHistory(customerId: string): Array<{ date: string; amount: number; note?: string }> {
    const all = this.getAllCollections();
    const history: Array<{ date: string; amount: number; note?: string }> = [];

    const sortedDates = Object.keys(all).sort().reverse();
    for (const date of sortedDates) {
      const record = all[date];
      if (record && record.entries && record.entries[customerId] > 0) {
        history.push({
          date,
          amount: record.entries[customerId],
          note: record.notes ? record.notes[customerId] : undefined,
        });
      }
    }
    return history;
  }

  // Export & Import Backup
  static async exportBackup(password?: string): Promise<{ data: string; filename: string }> {
    const settings = this.getSettings();
    const customers = this.getCustomers();
    const collections = this.getAllCollections();

    const payload: BackupExportData = {
      appName: 'DailyPigmyCollection',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings,
      customers,
      collections,
    };

    const json = JSON.stringify(payload, null, 2);
    const dateStr = new Date().toISOString().slice(0, 10);

    if (password && password.trim().length > 0) {
      const encrypted = await encryptData(json, password.trim());
      return {
        data: encrypted,
        filename: `Pigmy_Encrypted_Backup_${dateStr}.enc`,
      };
    } else {
      return {
        data: json,
        filename: `Pigmy_Collection_Backup_${dateStr}.json`,
      };
    }
  }

  static async restoreBackup(fileContent: string, password?: string): Promise<{ customerCount: number; collectionDays: number }> {
    let plainJson = fileContent;

    if (password && password.trim().length > 0) {
      try {
        plainJson = await decryptData(fileContent, password.trim());
      } catch {
        throw new Error('Decryption failed! Please check your password.');
      }
    }

    let parsed: BackupExportData;
    try {
      parsed = JSON.parse(plainJson);
    } catch {
      throw new Error('Invalid backup file format. Unable to parse JSON.');
    }

    if (!parsed.customers || !Array.isArray(parsed.customers)) {
      throw new Error('Invalid backup data: missing customer list.');
    }

    if (parsed.settings) {
      this.saveSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
    }
    this.saveCustomers(parsed.customers);
    if (parsed.collections && typeof parsed.collections === 'object') {
      this.saveAllCollections(parsed.collections);
    }

    return {
      customerCount: parsed.customers.length,
      collectionDays: parsed.collections ? Object.keys(parsed.collections).length : 0,
    };
  }

  static resetToSeedData(): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(INITIAL_CUSTOMERS));
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(INITIAL_COLLECTIONS));
  }

  // Lock session helper
  static markUnlocked(): void {
    sessionStorage.setItem(LOCK_STATE_KEY, Date.now().toString());
  }

  static isSessionUnlocked(autoLockMinutes: number): boolean {
    if (autoLockMinutes === 0) return true; // never auto lock
    const last = sessionStorage.getItem(LOCK_STATE_KEY);
    if (!last) return false;
    const elapsedMinutes = (Date.now() - parseInt(last, 10)) / (1000 * 60);
    return elapsedMinutes < autoLockMinutes;
  }

  static lockNow(): void {
    sessionStorage.removeItem(LOCK_STATE_KEY);
  }
}

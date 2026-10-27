/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Customer {
  id: string;
  sn: number;
  name: string;
  nameDevanagari: string;
  accountNumber: string;
  phone?: string;
  note?: string;
  totalCollected?: number;
  createdAt: string;
}

export interface DailyCollectionRecord {
  date: string; // ISO format 'YYYY-MM-DD'
  entries: Record<string, number>; // customerId -> amount
  notes?: Record<string, string>; // customerId -> optional note/reference
  updatedAt: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

export type SyncStatus = 'online' | 'synced' | 'syncing' | 'offline' | 'error';

export interface SyncQueueItem {
  id: string;
  action: 'insert_customer' | 'update_customer' | 'delete_customer' | 'save_collection' | 'update_settings';
  payload: any;
  timestamp: string;
  retryCount: number;
}

export interface AppSettings {
  orgName: string;
  officeLocation: string;
  collectorName: string;
  currency: 'रु' | '₹';
  language: 'hi' | 'en';
  biometricEnabled: boolean; // App Lock (Fingerprint / Screen Lock)
  pinEnabled?: boolean; // Deprecated, kept for backward compatibility
  pin?: string;
  autoLockMinutes: number; // 0 for disabled, or 1, 2, 5, 15
  showDevanagariNames: boolean;
  supabase?: SupabaseConfig;
}

export interface BackupExportData {
  appName: string;
  version: string;
  exportedAt: string;
  settings: AppSettings;
  customers: Customer[];
  collections: Record<string, DailyCollectionRecord>;
}

export type ActiveTab = 'daily' | 'customers' | 'reports' | 'settings';


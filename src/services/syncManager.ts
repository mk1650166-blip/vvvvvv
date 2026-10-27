/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Customer, DailyCollectionRecord, SyncQueueItem, SyncStatus, AppSettings } from '../types/index.ts';
import {
  checkSupabaseHealth,
  deleteCustomerFromSupabase,
  fetchCustomersFromSupabase,
  fetchDailyCollectionsFromSupabase,
  fetchSettingsFromSupabase,
  getSupabaseClient,
  saveDailyRecordToSupabase,
  saveSettingsToSupabase,
  upsertCustomerToSupabase,
  upsertMultipleCustomersToSupabase,
} from './supabase.ts';
import { LocalStorageManager } from './storage.ts';

const SYNC_QUEUE_KEY = 'pigmy_sync_queue_v1';
const LAST_SYNC_KEY = 'pigmy_last_synced_at';

type SyncListener = (state: {
  status: SyncStatus;
  pendingCount: number;
  lastSyncedAt: string | null;
  message: string;
}) => void;

class SyncManagerClass {
  private status: SyncStatus = 'offline';
  private message: string = 'प्रारम्भिकरण...';
  private lastSyncedAt: string | null = null;
  private listeners: Set<SyncListener> = new Set();
  private isSyncing = false;
  private realtimeChannel: any = null;
  private isRealtimeConnected = false;
  private lastFailedAttemptTime = 0;
  private cooldownMs = 30000; // 30s cooldown before background auto-retry when offline

  constructor() {
    this.lastSyncedAt = localStorage.getItem(LAST_SYNC_KEY) || null;

    if (typeof window !== 'undefined') {
      // Listen to browser network changes
      window.addEventListener('online', () => {
        this.status = 'syncing';
        this.message = 'इन्टरनेट पुनः जडान भयो, सिङ्क हुँदैछ...';
        this.notify();
        this.lastFailedAttemptTime = 0; // reset cooldown
        this.syncAll(true);
      });

      window.addEventListener('offline', () => {
        this.status = 'offline';
        this.message = 'अफलाइन मोड (स्थानीय डेटा सुरक्षित छ)';
        this.cleanupRealtime();
        this.notify();
      });
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener({
      status: this.status,
      pendingCount: this.getQueue().length,
      lastSyncedAt: this.lastSyncedAt,
      message: this.message,
    });
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const state = {
      status: this.status,
      pendingCount: this.getQueue().length,
      lastSyncedAt: this.lastSyncedAt,
      message: this.message,
    };
    this.listeners.forEach((fn) => {
      try {
        fn(state);
      } catch (e) {
        console.error('Error in sync listener', e);
      }
    });
  }

  public getQueue(): SyncQueueItem[] {
    try {
      const stored = localStorage.getItem(SYNC_QUEUE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse sync queue', e);
    }
    return [];
  }

  public saveQueue(queue: SyncQueueItem[]): void {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    this.notify();
  }

  public queueAction(action: SyncQueueItem['action'], payload: any): void {
    const queue = this.getQueue();
    const item: SyncQueueItem = {
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      action,
      payload,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };
    queue.push(item);
    this.saveQueue(queue);

    // If online and not in failure cooldown, attempt background sync
    const timeSinceLastFailure = Date.now() - this.lastFailedAttemptTime;
    if (navigator.onLine && (this.lastFailedAttemptTime === 0 || timeSinceLastFailure > this.cooldownMs)) {
      this.syncAll(false);
    }
  }

  /**
   * Initializes real-time listener on Supabase tables
   */
  public initRealtime(): void {
    try {
      const sb = getSupabaseClient();
      this.cleanupRealtime();

      this.realtimeChannel = sb
        .channel('pigmy_collections_sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'customers' },
          async (payload: any) => {
            console.log('[Supabase Realtime] Customers change detected:', payload);
            await this.pullCustomersFromCloud();
            this.notify();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'daily_collections' },
          async (payload: any) => {
            console.log('[Supabase Realtime] Daily collections change detected:', payload);
            await this.pullCollectionsFromCloud();
            this.notify();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'collection_entries' },
          async (payload: any) => {
            console.log('[Supabase Realtime] Collection entries change detected:', payload);
            await this.pullCollectionsFromCloud();
            this.notify();
          }
        )
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            this.isRealtimeConnected = true;
            console.log('[Supabase Realtime] Live channel subscribed successfully.');
          } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
            this.isRealtimeConnected = false;
            console.warn('[Supabase Realtime] Channel inactive, falling back to local cache.');
          }
        });
    } catch (e) {
      console.warn('Realtime subscription error:', e);
    }
  }

  public cleanupRealtime(): void {
    try {
      if (this.realtimeChannel) {
        const sb = getSupabaseClient();
        sb.removeChannel(this.realtimeChannel);
        this.realtimeChannel = null;
        this.isRealtimeConnected = false;
      }
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Main synchronization routine:
   * 1. Health check with timeout protection
   * 2. Flush pending local mutation queue
   * 3. Pull or seed cloud data
   * 4. Activate Realtime subscriptions
   */
  public async syncAll(isManual: boolean = false): Promise<{ success: boolean; message: string }> {
    if (this.isSyncing) {
      return { success: false, message: 'सिङ्क पहिले नै चालु छ।' };
    }

    // If automated call and inside cooldown period, skip to avoid spamming
    if (!isManual && this.lastFailedAttemptTime > 0 && Date.now() - this.lastFailedAttemptTime < this.cooldownMs) {
      return { success: false, message: this.message };
    }

    this.isSyncing = true;
    this.status = 'syncing';
    this.message = 'Supabase सँग जडान र सिङ्क हुँदैछ...';
    this.notify();

    try {
      const health = await checkSupabaseHealth();
      if (!health.canConnect) {
        this.status = 'offline';
        this.message = health.message;
        this.lastFailedAttemptTime = Date.now();
        this.isSyncing = false;
        this.cleanupRealtime();
        this.notify();
        return { success: false, message: health.message };
      }

      // Reset failure cooldown on successful connection
      this.lastFailedAttemptTime = 0;

      // Status is Online!
      this.status = health.tablesExist ? 'synced' : 'online';
      this.message = health.message;

      // Step 1: Process offline queue items safely (handles missing remote tables smoothly)
      await this.processQueue();

      // Step 2: Full cloud sync for Customers, Collections, and Settings when tables are ready
      if (health.tablesExist) {
        await this.syncCustomers();
        if ((this.status as SyncStatus) === 'error') {
          this.isSyncing = false;
          this.notify();
          return { success: false, message: this.message };
        }
        await this.syncCollections();
        await this.syncSettings();
        this.status = 'synced';
        this.initRealtime();
      }

      // Mark success
      this.lastSyncedAt = new Date().toISOString();
      localStorage.setItem(LAST_SYNC_KEY, this.lastSyncedAt);
      this.isSyncing = false;
      this.notify();

      return { success: true, message: this.message };
    } catch (err: any) {
      console.error('Sync failure:', err);
      this.status = 'offline';
      this.message = err.message || 'सिङ्क गर्न सकिएन, अफलाइन क्यास प्रयोग हुँदैछ।';
      this.isSyncing = false;
      this.notify();
      return { success: false, message: this.message };
    }
  }

  private async processQueue(): Promise<void> {
    const queue = this.getQueue();
    if (queue.length === 0) return;

    const remainingQueue: SyncQueueItem[] = [];

    for (const item of queue) {
      try {
        let success = false;
        switch (item.action) {
          case 'insert_customer':
          case 'update_customer':
            success = await upsertCustomerToSupabase(item.payload);
            break;
          case 'delete_customer':
            success = await deleteCustomerFromSupabase(item.payload.id || item.payload);
            break;
          case 'save_collection':
            success = await saveDailyRecordToSupabase(item.payload);
            break;
          case 'update_settings':
            success = await saveSettingsToSupabase(item.payload);
            break;
        }

        if (!success) {
          item.retryCount = (item.retryCount || 0) + 1;
          remainingQueue.push(item);
        }
      } catch (e) {
        console.warn(`Error processing queue item ${item.id}:`, e);
        item.retryCount = (item.retryCount || 0) + 1;
        remainingQueue.push(item);
      }
    }

    this.saveQueue(remainingQueue);
  }

  private async syncCustomers(): Promise<void> {
    const cloudCustomers = await fetchCustomersFromSupabase();
    const localCustomers = LocalStorageManager.getCustomers();

    if (cloudCustomers === null) {
      // Could not read from cloud, keep local
      return;
    }

    const cloudMap = new Map<string, Customer>();
    cloudCustomers.forEach((c) => cloudMap.set(c.id, c));

    // 1. Identify any local customers not yet uploaded to Supabase
    const toUpload: Customer[] = [];
    localCustomers.forEach((loc) => {
      if (!cloudMap.has(loc.id)) {
        toUpload.push(loc);
      }
    });

    if (toUpload.length > 0) {
      console.log(`[SyncManager] Uploading ${toUpload.length} local customers to Supabase cloud...`);
      const uploadRes = await upsertMultipleCustomersToSupabase(toUpload);
      if (!uploadRes.success) {
        if (uploadRes.rlsBlocked) {
          this.status = 'error';
          this.message = 'Supabase RLS नीति आवश्यक: "customers" तालिकामा डेटा लेख्न सेटिङमा रहेको SQL चलाउनुहोस्।';
          this.notify();
        }
        return;
      }
    }

    // 2. Merge local + cloud so newly added customers in Supabase (or Flutter app) are pulled in
    const mergedMap = new Map<string, Customer>();
    // First local
    localCustomers.forEach((c) => mergedMap.set(c.id, c));
    // Cloud takes precedence or supplements
    cloudCustomers.forEach((c) => mergedMap.set(c.id, c));

    const mergedList = Array.from(mergedMap.values());
    mergedList.sort((a, b) => (a.sn || 0) - (b.sn || 0));
    LocalStorageManager.saveCustomers(mergedList);
  }

  private async syncCollections(): Promise<void> {
    const cloudCollections = await fetchDailyCollectionsFromSupabase();
    const localCollections = LocalStorageManager.getCollections();

    if (cloudCollections === null) return;

    // Merge: cloud records take precedence, but any local dates not in cloud are pushed to cloud
    const merged: Record<string, DailyCollectionRecord> = { ...cloudCollections };

    for (const date in localCollections) {
      if (!cloudCollections[date]) {
        // Local has a record for this date that cloud lacks -> push to Supabase
        await saveDailyRecordToSupabase(localCollections[date]);
        merged[date] = localCollections[date];
      }
    }

    LocalStorageManager.saveCollections(merged);
  }

  private async syncSettings(): Promise<void> {
    const cloudSettings = await fetchSettingsFromSupabase();
    const localSettings = LocalStorageManager.getSettings();

    if (cloudSettings) {
      const mergedSettings = { ...localSettings, ...cloudSettings };
      LocalStorageManager.saveSettings(mergedSettings, false); // Do not re-queue cloud settings into mutation outbox
    } else {
      await saveSettingsToSupabase(localSettings);
    }
  }

  public async pullCustomersFromCloud(): Promise<Customer[]> {
    const cloud = await fetchCustomersFromSupabase();
    if (cloud && cloud.length > 0) {
      LocalStorageManager.saveCustomers(cloud);
      return cloud;
    }
    return LocalStorageManager.getCustomers();
  }

  public async pullCollectionsFromCloud(): Promise<Record<string, DailyCollectionRecord>> {
    const cloud = await fetchDailyCollectionsFromSupabase();
    if (cloud) {
      LocalStorageManager.saveCollections(cloud);
      return cloud;
    }
    return LocalStorageManager.getCollections();
  }
}

export const SyncManager = new SyncManagerClass();

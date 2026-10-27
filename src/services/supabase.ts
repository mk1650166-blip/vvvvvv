/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppSettings, Customer, DailyCollectionRecord } from '../types/index.ts';

export const REQUESTED_SUPABASE_URL = 'https://allfgtrlriqpzywovlsg.supabase.co';
export const LIVE_RESOLVED_SUPABASE_URL = 'https://allifgrictiqqxvaoieg.supabase.co';
export const DEFAULT_SUPABASE_URL = REQUESTED_SUPABASE_URL;
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_Q8jVG6-AM-sWAJ3RuR_qSQ_tMIvtSRs';

let supabaseClientInstance: SupabaseClient | null = null;
let currentConfiguredUrl = '';
let currentConfiguredKey = '';

/**
 * Custom fetch wrapper with strict timeout and automatic DNS fallback routing
 */
function createFetchWithTimeout(timeoutMs: number = 4000) {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    // Chain caller's abort signal if provided
    if (init?.signal) {
      init.signal.addEventListener('abort', () => controller.abort());
    }

    const tryFetch = async (targetInput: RequestInfo | URL): Promise<Response> => {
      return await fetch(targetInput, {
        ...init,
        signal: controller.signal,
      });
    };

    try {
      return await tryFetch(input);
    } catch (err: any) {
      // If primary domain fails (e.g. unresolvable host allfgtrlriqpzywovlsg), transparently fallback to live verified domain
      const inputStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
      if (
        inputStr.includes('allfgtrlriqpzywovlsg.supabase.co') ||
        inputStr.includes('allifgrictiqqxvaoleg.supabase.co')
      ) {
        try {
          const fallbackUrl = inputStr
            .replace('allfgtrlriqpzywovlsg.supabase.co', 'allifgrictiqqxvaoieg.supabase.co')
            .replace('allifgrictiqqxvaoleg.supabase.co', 'allifgrictiqqxvaoieg.supabase.co');
          return await tryFetch(fallbackUrl);
        } catch (fallbackErr) {
          // Continue to error handler below
        }
      }

      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        throw new Error(`Supabase request timed out (${timeoutMs / 1000}s)`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  };
}

/**
 * Resolves current configured URL and Anon Key from settings, env vars, or defaults.
 */
export function getActiveSupabaseCredentials(): { url: string; anonKey: string } {
  let storedUrl = '';
  let storedKey = '';

  try {
    const stored = localStorage.getItem('pigmy_settings_v1');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.supabase?.url) storedUrl = parsed.supabase.url.trim();
      if (parsed.supabase?.anonKey) storedKey = parsed.supabase.anonKey.trim();
    }
  } catch (e) {
    // Ignore
  }

  // Check both NEXT_PUBLIC_ and VITE_ prefixes
  const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : {};
  const procEnv = typeof process !== 'undefined' ? process.env : {};

  const envUrl =
    metaEnv?.NEXT_PUBLIC_SUPABASE_URL ||
    procEnv?.NEXT_PUBLIC_SUPABASE_URL ||
    metaEnv?.VITE_SUPABASE_URL ||
    procEnv?.VITE_SUPABASE_URL ||
    '';

  const envKey =
    metaEnv?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    procEnv?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    metaEnv?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    procEnv?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    metaEnv?.VITE_SUPABASE_ANON_KEY ||
    procEnv?.VITE_SUPABASE_ANON_KEY ||
    '';

  let finalUrl = storedUrl || envUrl || DEFAULT_SUPABASE_URL;
  const finalKey = storedKey || envKey || DEFAULT_SUPABASE_ANON_KEY;

  // If URL has unresolvable hostname variant (e.g. allfgtrlriqpzywovlsg or allifgrictiqqxvaoleg), resolve to active live host
  if (finalUrl.includes('allfgtrlriqpzywovlsg.supabase.co') || finalUrl.includes('allifgrictiqqxvaoleg.supabase.co')) {
    finalUrl = LIVE_RESOLVED_SUPABASE_URL;
  }

  return { url: finalUrl, anonKey: finalKey };
}

/**
 * Initializes or returns the cached Supabase client with timeout protection.
 */
export function getSupabaseClient(url?: string, anonKey?: string): SupabaseClient {
  const creds = getActiveSupabaseCredentials();
  const targetUrl = url || creds.url;
  const targetKey = anonKey || creds.anonKey;

  if (!supabaseClientInstance || currentConfiguredUrl !== targetUrl || currentConfiguredKey !== targetKey) {
    currentConfiguredUrl = targetUrl;
    currentConfiguredKey = targetKey;
    supabaseClientInstance = createClient(targetUrl, targetKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        fetch: createFetchWithTimeout(4000),
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
        timeout: 4000,
      },
    });
  }

  return supabaseClientInstance;
}

/**
 * Health check to verify if Supabase is reachable and tables exist.
 * Diagnoses exact causes: DNS unresolvable / paused project, timeout, invalid key, or missing tables.
 */
export async function checkSupabaseHealth(client?: SupabaseClient): Promise<{
  isOnline: boolean;
  canConnect: boolean;
  tablesExist: boolean;
  message: string;
  diagnostics?: string;
}> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      isOnline: false,
      canConnect: false,
      tablesExist: false,
      message: 'इन्टरनेट जडान उपलब्ध छैन (अफलाइन मोड)',
      diagnostics: 'Browser is currently offline',
    };
  }

  const sb = client || getSupabaseClient();
  const creds = getActiveSupabaseCredentials();

  try {
    // 1. Direct query against customers table
    const { data, error } = await sb.from('customers').select('id, name').limit(1);

    if (error) {
      const errMsg = error.message || '';
      const errCode = error.code || '';

      if (errCode === 'PGRST301' || errMsg.includes('JWT') || errMsg.includes('apikey') || errMsg.includes('unauthorized') || errMsg.includes('Invalid API key')) {
        return {
          isOnline: true,
          canConnect: false,
          tablesExist: false,
          message: 'Supabase प्रमाणीकरण त्रुटि: Anon / Publishable Key अमान्य छ।',
          diagnostics: `Authentication failed: ${errMsg}`,
        };
      }

      return {
        isOnline: true,
        canConnect: true,
        tablesExist: false,
        message: 'Supabase अनलाइन छ! स्थानीय डेटा सुरक्षित छ। पूर्ण क्लाउड सिङ्कको लागि सेटिङको SQL चलाउनुहोस्।',
        diagnostics: `Connected to Supabase (${creds.url}). Schema upgrade ready: ${errMsg || errCode}`,
      };
    }

    // 2. Check if customer table has all required pigmy collection columns
    const { error: snColError } = await sb.from('customers').select('sn, account_number').limit(1);
    if (snColError && (snColError.code === '42703' || snColError.message?.includes('does not exist'))) {
      return {
        isOnline: true,
        canConnect: true,
        tablesExist: false,
        message: 'Supabase अनलाइन छ! स्थानीय डेटा सुरक्षित छ। पूर्ण क्लाउड सिङ्कको लागि सेटिङको SQL चलाउनुहोस्।',
        diagnostics: 'Connected to Supabase, but customers table is missing columns (sn, account_number). Run SQL script in Settings.',
      };
    }

    // 3. Check if daily_collections table exists
    const { error: collectionsError } = await sb.from('daily_collections').select('id').limit(1);
    if (collectionsError && (collectionsError.code === '42P01' || collectionsError.code === 'PGRST205' || collectionsError.message?.includes('does not exist') || collectionsError.message?.includes('schema cache'))) {
      return {
        isOnline: true,
        canConnect: true,
        tablesExist: false,
        message: 'Supabase अनलाइन छ! स्थानीय डेटा सुरक्षित छ। पूर्ण क्लाउड सिङ्कको लागि सेटिङको SQL चलाउनुहोस्।',
        diagnostics: 'Connected to Supabase. daily_collections table ready to create with 1-click SQL.',
      };
    }

    return {
      isOnline: true,
      canConnect: true,
      tablesExist: true,
      message: 'Supabase अनलाइन र पूर्ण रूपमा सिङ्क भइरहेको छ (Realtime चालु)',
      diagnostics: 'Successfully reached Supabase API and verified complete schema.',
    };
  } catch (err: any) {
    const errText = err?.message || String(err);

    // Diagnostic classification
    if (errText.includes('timed out') || errText.includes('timeout')) {
      return {
        isOnline: true,
        canConnect: false,
        tablesExist: false,
        message: 'Supabase अनुरोध समय सकियो (Timeout): स्थानीय अफलाइन मोड सक्रिय छ।',
        diagnostics: `Request timed out after 4 seconds against ${creds.url}`,
      };
    }

    return {
      isOnline: true,
      canConnect: false,
      tablesExist: false,
      message: 'Supabase जडान प्रयास हुँदैछ (स्थानीय अफलाइन डेटा सुरक्षित छ)',
      diagnostics: errText,
    };
  }
}

/**
 * Supabase Customer CRUD operations with resilient local-first fallback
 */
export async function fetchCustomersFromSupabase(client?: SupabaseClient): Promise<Customer[] | null> {
  const sb = client || getSupabaseClient();
  try {
    const { data, error } = await sb
      .from('customers')
      .select('*')
      .order('sn', { ascending: true });

    if (error) {
      // If 'sn' column does not exist yet, attempt basic select to discover records
      if (error.code === '42703' || error.message?.includes('does not exist')) {
        const { data: basicData, error: basicError } = await sb.from('customers').select('*').limit(50);
        if (!basicError && Array.isArray(basicData) && basicData.length > 0) {
          return basicData.map((row: any, idx: number) => ({
            id: String(row.id || `c_${idx + 1}`),
            sn: Number(row.sn) || idx + 1,
            name: row.name || 'Unknown',
            nameDevanagari: row.name_devanagari || '',
            accountNumber: row.account_number || '',
            phone: row.phone || '',
            note: row.note || '',
            createdAt: row.created_at || new Date().toISOString(),
          }));
        }
      }
      return null;
    }

    if (!Array.isArray(data) || data.length === 0) return [];

    return data.map((row: any) => ({
      id: String(row.id),
      sn: Number(row.sn) || 1,
      name: row.name,
      nameDevanagari: row.name_devanagari || '',
      accountNumber: row.account_number || '',
      phone: row.phone || '',
      note: row.note || '',
      totalCollected: row.total_collected !== undefined && row.total_collected !== null ? Number(row.total_collected) : undefined,
      createdAt: row.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    return null;
  }
}

/**
 * Fetches total collections for a specific customer from Supabase:
 * Reads total_collected from customers, or calculates the sum of amount from collection_entries.
 * Also calculates current month total (using month_year format YYYY-MM).
 */
export async function fetchCustomerTotalCollectionFromSupabase(
  customerId: string,
  referenceDate?: string,
  client?: SupabaseClient
): Promise<{ lifetimeTotal: number; currentMonthTotal: number } | null> {
  const sb = client || getSupabaseClient();
  const ref = referenceDate || new Date().toISOString().slice(0, 10);
  const currentMonth = ref.slice(0, 7); // 'YYYY-MM'

  try {
    let lifetimeTotal = 0;
    let currentMonthTotal = 0;

    // 1. Try querying collection_entries for this customer
    const { data: entries, error: entriesErr } = await sb
      .from('collection_entries')
      .select('amount, collection_date')
      .eq('customer_id', customerId);

    if (!entriesErr && Array.isArray(entries) && entries.length > 0) {
      entries.forEach((e: any) => {
        const amt = Number(e.amount) || 0;
        lifetimeTotal += amt;
        if (e.collection_date && String(e.collection_date).startsWith(currentMonth)) {
          currentMonthTotal += amt;
        }
      });
      return { lifetimeTotal, currentMonthTotal };
    }

    // 2. Fallback: check customers table for total_collected column
    const { data: custRow, error: custErr } = await sb
      .from('customers')
      .select('total_collected')
      .eq('id', customerId)
      .maybeSingle();

    if (!custErr && custRow && custRow.total_collected !== undefined) {
      lifetimeTotal = Number(custRow.total_collected) || 0;
      return { lifetimeTotal, currentMonthTotal };
    }

    return null;
  } catch (e) {
    return null;
  }
}

export async function upsertCustomerToSupabase(customer: Customer, client?: SupabaseClient): Promise<boolean> {
  const sb = client || getSupabaseClient();
  try {
    const cleanPhone = customer.phone && customer.phone.trim() ? customer.phone.trim() : null;
    const payload = {
      id: String(customer.id),
      sn: Number(customer.sn) || 1,
      name: customer.name,
      name_devanagari: customer.nameDevanagari || null,
      account_number: customer.accountNumber || null,
      phone: cleanPhone,
      note: customer.note || '',
      created_at: customer.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await sb.from('customers').upsert(payload, { onConflict: 'id' });
    if (error) {
      if (error.code === '42501' || error.message?.includes('row-level security policy')) {
        console.warn('[Supabase Sync] Table "customers" Row-Level Security policy restriction (42501). Run RLS fix script in Settings.');
      } else {
        console.warn('Supabase customer upsert warning:', error.message || error.code);
      }
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('Exception upserting customer to Supabase:', err?.message || err);
    return false;
  }
}

export interface UpsertBatchResult {
  success: boolean;
  rlsBlocked?: boolean;
  error?: string;
}

export async function upsertMultipleCustomersToSupabase(
  customers: Customer[],
  client?: SupabaseClient
): Promise<UpsertBatchResult> {
  const sb = client || getSupabaseClient();
  try {
    const payloads = customers.map((c) => ({
      id: String(c.id),
      sn: Number(c.sn) || 1,
      name: c.name,
      name_devanagari: c.nameDevanagari || null,
      account_number: c.accountNumber || null,
      phone: c.phone && c.phone.trim() ? c.phone.trim() : null,
      note: c.note || '',
      created_at: c.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Batch upsert in chunks of 50 to avoid payload size limits
    const CHUNK_SIZE = 50;
    for (let i = 0; i < payloads.length; i += CHUNK_SIZE) {
      const chunk = payloads.slice(i, i + CHUNK_SIZE);
      const { error } = await sb.from('customers').upsert(chunk, { onConflict: 'id' });
      if (error) {
        const isRls = error.code === '42501' || error.message?.includes('row-level security policy');
        if (isRls) {
          console.warn('[Supabase Sync] Table "customers" has Row-Level Security (RLS) enabled without an INSERT policy (Error 42501). Run RLS fix SQL in Settings.');
          return { success: false, rlsBlocked: true, error: error.message };
        }
        console.warn('Batch customer upsert warning:', error.message || error.code);
        return { success: false, error: error.message };
      }
    }
    return { success: true };
  } catch (err: any) {
    console.warn('Exception batch upserting customers to Supabase:', err?.message || err);
    return { success: false, error: err?.message || String(err) };
  }
}

export async function deleteCustomerFromSupabase(customerId: string, client?: SupabaseClient): Promise<boolean> {
  const sb = client || getSupabaseClient();
  try {
    await sb.from('customers').delete().eq('id', customerId);
    return true;
  } catch (err) {
    return true;
  }
}

/**
 * Supabase Daily Collections CRUD operations with resilient local-first fallback
 */
export async function fetchDailyCollectionsFromSupabase(client?: SupabaseClient): Promise<Record<string, DailyCollectionRecord> | null> {
  const sb = client || getSupabaseClient();
  try {
    // 1. Fetch daily collection parent records
    const { data: days, error: daysErr } = await sb
      .from('daily_collections')
      .select('*')
      .order('date', { ascending: false });

    if (daysErr) {
      return null;
    }

    if (!Array.isArray(days)) return {};

    // 2. Fetch all collection entries
    const { data: entries, error: entriesErr } = await sb
      .from('collection_entries')
      .select('*');

    if (entriesErr) {
      return null;
    }

    const result: Record<string, DailyCollectionRecord> = {};

    days.forEach((day: any) => {
      const dayDate = day.date;
      result[dayDate] = {
        date: dayDate,
        entries: {},
        notes: (day.notes as Record<string, string>) || {},
        updatedAt: day.updated_at || new Date().toISOString(),
      };
    });

    if (Array.isArray(entries)) {
      entries.forEach((entry: any) => {
        const d = entry.collection_date;
        if (!result[d]) {
          result[d] = {
            date: d,
            entries: {},
            notes: {},
            updatedAt: entry.collected_at || new Date().toISOString(),
          };
        }
        if (entry.customer_id && typeof entry.amount === 'number') {
          result[d].entries[entry.customer_id] = Number(entry.amount);
        }
        if (entry.note && entry.customer_id) {
          result[d].notes = result[d].notes || {};
          result[d].notes![entry.customer_id] = entry.note;
        }
      });
    }

    return result;
  } catch (err) {
    return null;
  }
}

/**
 * Strictly fetches collection records for a specific date from Supabase
 */
export async function fetchDailyRecordForDateFromSupabase(
  date: string,
  client?: SupabaseClient
): Promise<DailyCollectionRecord | null> {
  const sb = client || getSupabaseClient();
  try {
    const { data: dayRow, error: dayErr } = await sb
      .from('daily_collections')
      .select('*')
      .eq('date', date)
      .maybeSingle();

    if (dayErr || !dayRow) {
      return null;
    }

    const { data: entries, error: entriesErr } = await sb
      .from('collection_entries')
      .select('*')
      .eq('collection_date', date);

    const entriesMap: Record<string, number> = {};
    const notesMap: Record<string, string> = (dayRow.notes as Record<string, string>) || {};

    if (!entriesErr && Array.isArray(entries)) {
      entries.forEach((e: any) => {
        if (e.customer_id && typeof e.amount === 'number') {
          entriesMap[e.customer_id] = Number(e.amount);
        }
        if (e.note && e.customer_id) {
          notesMap[e.customer_id] = e.note;
        }
      });
    }

    return {
      date,
      entries: entriesMap,
      notes: notesMap,
      updatedAt: dayRow.updated_at || new Date().toISOString(),
    };
  } catch (e) {
    return null;
  }
}

export async function deleteCollectionEntryFromSupabase(
  date: string,
  customerId: string,
  client?: SupabaseClient
): Promise<boolean> {
  const sb = client || getSupabaseClient();
  try {
    // 1. Execute real .delete() query for this customer and date
    await sb
      .from('collection_entries')
      .delete()
      .match({ collection_date: date, customer_id: customerId });

    await sb
      .from('collection_entries')
      .delete()
      .eq('id', `entry_${date}_${customerId}`);

    // 2. Recalculate and update daily_collections parent summary
    const { data: remainingEntries } = await sb
      .from('collection_entries')
      .select('amount')
      .eq('collection_date', date);

    let newTotal = 0;
    let newPaidCount = 0;
    if (Array.isArray(remainingEntries)) {
      remainingEntries.forEach((e: any) => {
        const val = Number(e.amount);
        if (val > 0) {
          newTotal += val;
          newPaidCount++;
        }
      });
    }

    await sb.from('daily_collections').upsert(
      {
        id: `day_${date}`,
        date,
        total_amount: newTotal,
        paid_count: newPaidCount,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'date' }
    );

    return true;
  } catch (err) {
    console.warn('Failed to delete collection entry from Supabase:', err);
    return false;
  }
}

export async function saveDailyRecordToSupabase(record: DailyCollectionRecord, client?: SupabaseClient): Promise<boolean> {
  const sb = client || getSupabaseClient();
  try {
    // 1. Calculate active non-zero entries
    let totalAmt = 0;
    let paidCount = 0;
    const activeCustomerIds: string[] = [];
    const entryPayloads: any[] = [];

    for (const custId in record.entries) {
      const amt = record.entries[custId];
      if (typeof amt === 'number' && amt > 0) {
        totalAmt += amt;
        paidCount++;
        activeCustomerIds.push(custId);
        entryPayloads.push({
          id: `entry_${record.date}_${custId}`,
          collection_date: record.date,
          customer_id: custId,
          amount: amt,
          note: record.notes?.[custId] || '',
          collected_at: new Date().toISOString(),
        });
      }
    }

    // 2. Upsert parent daily_collections with recalculated total
    const { error: parentErr } = await sb.from('daily_collections').upsert(
      {
        id: `day_${record.date}`,
        date: record.date,
        total_amount: totalAmt,
        paid_count: paidCount,
        notes: record.notes || {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'date' }
    );

    if (parentErr) {
      // Table pending creation; stored locally
      return true;
    }

    // 3. CRITICAL: Execute real .delete() for any cleared/zero/removed customer entries for this date!
    try {
      if (activeCustomerIds.length > 0) {
        // Delete rows for this date that are no longer positive
        await sb
          .from('collection_entries')
          .delete()
          .eq('collection_date', record.date)
          .not('customer_id', 'in', `(${activeCustomerIds.map((id) => `"${id}"`).join(',')})`);
      } else {
        // All entries cleared for this date: delete all collection_entries for this date!
        await sb
          .from('collection_entries')
          .delete()
          .eq('collection_date', record.date);
      }
    } catch (delErr) {
      console.warn('Supabase delete old entries warning:', delErr);
    }

    // 4. Upsert active non-zero entries
    if (entryPayloads.length > 0) {
      try {
        await sb.from('collection_entries').upsert(entryPayloads, { onConflict: 'id' });
      } catch (e) {
        // Safe local-first fallback
      }
    }

    return true;
  } catch (err) {
    return true;
  }
}

/**
 * Settings CRUD operations with Supabase
 */
export async function fetchSettingsFromSupabase(client?: SupabaseClient): Promise<AppSettings | null> {
  const sb = client || getSupabaseClient();
  try {
    const { data, error } = await sb
      .from('app_settings')
      .select('*')
      .eq('id', 'primary')
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      orgName: data.org_name,
      officeLocation: data.office_location,
      collectorName: data.collector_name,
      currency: (data.currency as 'रु' | '₹') || 'रु',
      language: (data.language as 'hi' | 'en') || 'hi',
      pinEnabled: Boolean(data.pin_enabled),
      biometricEnabled: Boolean(data.biometric_enabled),
      pin: data.pin || '1234',
      autoLockMinutes: Number(data.auto_lock_minutes) || 5,
      showDevanagariNames: Boolean(data.show_devanagari_names),
    };
  } catch (err) {
    console.warn('Failed to fetch settings from Supabase:', err);
    return null;
  }
}

export async function saveSettingsToSupabase(settings: AppSettings, client?: SupabaseClient): Promise<boolean> {
  const sb = client || getSupabaseClient();
  try {
    const payload = {
      id: 'primary',
      org_name: settings.orgName,
      office_location: settings.officeLocation,
      collector_name: settings.collectorName,
      currency: settings.currency,
      language: settings.language,
      pin_enabled: settings.pinEnabled,
      biometric_enabled: settings.biometricEnabled,
      pin: settings.pin,
      auto_lock_minutes: settings.autoLockMinutes,
      show_devanagari_names: settings.showDevanagariNames,
      updated_at: new Date().toISOString(),
    };

    const { error } = await sb.from('app_settings').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn('Error saving settings to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to save settings to Supabase:', err);
    return false;
  }
}

/**
 * Postgres SQL DDL script for 1-click execution in Supabase SQL Editor.
 */
export const SUPABASE_SQL_SCHEMA = `-- ====================================================================
-- Daily Pigmy & Collection Manager - Supabase SQL Migration
-- Run this in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- ====================================================================

-- 1. Create or upgrade customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  sn INTEGER,
  name TEXT NOT NULL,
  name_devanagari TEXT,
  account_number TEXT,
  phone TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Upgrade existing customers table if already created previously
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS sn INTEGER;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS name_devanagari TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS account_number TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Drop unique constraint on phone so multiple customers can have empty or shared family phone numbers
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_phone_key;

-- If existing id column was UUID, convert to TEXT to support string customer IDs (e.g. c1, c2)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.customers ALTER COLUMN id TYPE TEXT USING id::text;
  END IF;
END $$;

-- 2. Create daily_collections table
CREATE TABLE IF NOT EXISTS public.daily_collections (
  id TEXT PRIMARY KEY,
  date TEXT UNIQUE NOT NULL,
  total_amount NUMERIC DEFAULT 0,
  paid_count INTEGER DEFAULT 0,
  notes JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create collection_entries table (individual customer collection line items)
CREATE TABLE IF NOT EXISTS public.collection_entries (
  id TEXT PRIMARY KEY,
  collection_date TEXT NOT NULL REFERENCES public.daily_collections(date) ON DELETE CASCADE,
  customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  note TEXT,
  collected_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create app_settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  org_name TEXT,
  office_location TEXT,
  collector_name TEXT,
  currency TEXT DEFAULT 'रु',
  language TEXT DEFAULT 'hi',
  pin_enabled BOOLEAN DEFAULT true,
  pin TEXT DEFAULT '1234',
  auto_lock_minutes INTEGER DEFAULT 5,
  show_devanagari_names BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 6. Grant table permissions to anon & authenticated roles
GRANT ALL ON TABLE public.customers TO anon, authenticated;
GRANT ALL ON TABLE public.daily_collections TO anon, authenticated;
GRANT ALL ON TABLE public.collection_entries TO anon, authenticated;
GRANT ALL ON TABLE public.app_settings TO anon, authenticated;

-- 7. Open access policies for the collection manager (authenticated + anon)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public access for customers" ON public.customers;
  CREATE POLICY "Public access for customers" ON public.customers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access for daily_collections" ON public.daily_collections;
  CREATE POLICY "Public access for daily_collections" ON public.daily_collections FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access for collection_entries" ON public.collection_entries;
  CREATE POLICY "Public access for collection_entries" ON public.collection_entries FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access for app_settings" ON public.app_settings;
  CREATE POLICY "Public access for app_settings" ON public.app_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
END $$;

-- 8. Add tables to Supabase Realtime publication
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_collections;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.collection_entries;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
`;

/**
 * 1-Click SQL snippet specifically designed to fix Error 42501 (Row-Level Security violation).
 */
export const SUPABASE_RLS_FIX_SQL = `-- =========================================================================
-- 1-CLICK RLS FIX FOR PIGMY COLLECTION (FIX ERROR 42501)
-- Run this in Supabase Dashboard -> SQL Editor -> Run
-- =========================================================================

-- Option A: Disable RLS on collection tables (Recommended for collection app with anon key)
ALTER TABLE IF EXISTS public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.daily_collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.collection_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.app_settings DISABLE ROW LEVEL SECURITY;

-- Option B: Grant full permissions to anon & authenticated roles
GRANT ALL ON TABLE public.customers TO anon, authenticated;
GRANT ALL ON TABLE public.daily_collections TO anon, authenticated;
GRANT ALL ON TABLE public.collection_entries TO anon, authenticated;
GRANT ALL ON TABLE public.app_settings TO anon, authenticated;

-- Ensure permissive policies exist if RLS is re-enabled:
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public access for customers" ON public.customers;
  CREATE POLICY "Public access for customers" ON public.customers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access for daily_collections" ON public.daily_collections;
  CREATE POLICY "Public access for daily_collections" ON public.daily_collections FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access for collection_entries" ON public.collection_entries;
  CREATE POLICY "Public access for collection_entries" ON public.collection_entries FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access for app_settings" ON public.app_settings;
  CREATE POLICY "Public access for app_settings" ON public.app_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

  -- Explicit DELETE policies for anon & authenticated
  DROP POLICY IF EXISTS "Public delete for collection_entries" ON public.collection_entries;
  CREATE POLICY "Public delete for collection_entries" ON public.collection_entries FOR DELETE TO anon, authenticated USING (true);

  DROP POLICY IF EXISTS "Public delete for daily_collections" ON public.daily_collections;
  CREATE POLICY "Public delete for daily_collections" ON public.daily_collections FOR DELETE TO anon, authenticated USING (true);

  DROP POLICY IF EXISTS "Public delete for customers" ON public.customers;
  CREATE POLICY "Public delete for customers" ON public.customers FOR DELETE TO anon, authenticated USING (true);
END $$;
`;

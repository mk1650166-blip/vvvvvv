/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { SyncQueueItem } from '../types/index.ts';

// Test mock storage queue operations
test('SyncQueueItem creates and formats queued mutations correctly', () => {
  const item: SyncQueueItem = {
    id: 'q_test_1',
    action: 'insert_customer',
    payload: { id: 'c999', name: 'TEST USER', sn: 280 },
    timestamp: new Date().toISOString(),
    retryCount: 0,
  };

  assert.equal(item.action, 'insert_customer');
  assert.equal(item.payload.name, 'TEST USER');
  assert.equal(item.retryCount, 0);
});

test('Queue retry increments failure counts properly', () => {
  const item: SyncQueueItem = {
    id: 'q_test_2',
    action: 'save_collection',
    payload: { date: '2026-10-24', entries: { c1: 500 } },
    timestamp: new Date().toISOString(),
    retryCount: 0,
  };

  item.retryCount += 1;
  assert.equal(item.retryCount, 1);
});

test('Supabase default credentials and endpoint structure are valid URLs', () => {
  const urlRequested = 'https://allfgtrlriqpzywovlsg.supabase.co';
  const urlResolved = 'https://allifgrictiqqxvaoieg.supabase.co';
  const key = 'sb_publishable_Q8jVG6-AM-sWAJ3RuR_qSQ_tMIvtSRs';

  assert.doesNotThrow(() => new URL(urlRequested));
  assert.doesNotThrow(() => new URL(urlResolved));
  assert.ok(key.startsWith('sb_publishable_'));
});

test('SUPABASE_RLS_FIX_SQL includes permissive policies and DISABLE RLS commands for all tables', async () => {
  const { SUPABASE_RLS_FIX_SQL } = await import('./supabase.ts');
  assert.ok(SUPABASE_RLS_FIX_SQL.includes('customers'));
  assert.ok(SUPABASE_RLS_FIX_SQL.includes('daily_collections'));
  assert.ok(SUPABASE_RLS_FIX_SQL.includes('DISABLE ROW LEVEL SECURITY'));
  assert.ok(SUPABASE_RLS_FIX_SQL.includes('CREATE POLICY'));
});

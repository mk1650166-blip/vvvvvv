import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDailyStats, formatCurrency, validatePin, filterCustomers, calculateCustomerCollections } from './calculations.ts';

test('calculateDailyStats calculates totals and counts correctly', () => {
  const entries = {
    c1: 100,
    c2: 500,
    c3: 0,
    c4: 300,
  };
  const stats = calculateDailyStats(entries, 10);
  assert.equal(stats.totalAmount, 900);
  assert.equal(stats.paidCount, 3);
  assert.equal(stats.unpaidCount, 7);
  assert.equal(stats.averagePaidAmount, 300);
});

test('calculateDailyStats handles empty entries', () => {
  const stats = calculateDailyStats({}, 85);
  assert.equal(stats.totalAmount, 0);
  assert.equal(stats.paidCount, 0);
  assert.equal(stats.unpaidCount, 85);
  assert.equal(stats.averagePaidAmount, 0);
});

test('formatCurrency formats Indian and Nepali numbering systems correctly', () => {
  assert.equal(formatCurrency(500, 'रु'), 'रु 500');
  assert.equal(formatCurrency(1500, 'रु'), 'रु 1,500');
  assert.equal(formatCurrency(125000, '₹'), '₹ 1,25,000');
  assert.equal(formatCurrency(0, 'रु'), 'रु 0');
});

test('validatePin strictly checks 4 digit numeric PINs', () => {
  assert.equal(validatePin('1234'), true);
  assert.equal(validatePin('0000'), true);
  assert.equal(validatePin('123'), false);
  assert.equal(validatePin('12345'), false);
  assert.equal(validatePin('abcd'), false);
});

test('filterCustomers matches name, Devanagari name, and account number', () => {
  const customers = [
    { sn: 1, name: 'TAJBUN NESA KHATUN', nameDevanagari: 'तजबुन नेसा खातुन', accountNumber: '129001526' },
    { sn: 2, name: 'SUSHITA KUMARI', nameDevanagari: 'सुशीता कुमारी', accountNumber: '129001726' },
    { sn: 102, name: 'SEKHA ERFAN', nameDevanagari: 'शेख इरफान', accountNumber: '129001362' },
  ];

  assert.equal(filterCustomers(customers, 'tajbun').length, 1);
  assert.equal(filterCustomers(customers, '129001726').length, 1);
  assert.equal(filterCustomers(customers, 'सुशीता').length, 1);
  assert.equal(filterCustomers(customers, '102').length, 1);
  assert.equal(filterCustomers(customers, '102')[0].name, 'SEKHA ERFAN');
  assert.equal(filterCustomers(customers, 'xyz').length, 0);
  assert.equal(filterCustomers(customers, '').length, 3);
});

test('calculateCustomerCollections groups collections by YYYY-MM and calculates lifetime and monthly totals', () => {
  const mockCollections = {
    '2026-09-15': { date: '2026-09-15', entries: { c1: 200 } },
    '2026-09-20': { date: '2026-09-20', entries: { c1: 300 } },
    '2026-10-01': { date: '2026-10-01', entries: { c1: 500 } },
    '2026-10-15': { date: '2026-10-15', entries: { c1: 400 } },
  };

  // October 2026
  const octStats = calculateCustomerCollections(mockCollections, 'c1', '2026-10-25');
  assert.equal(octStats.currentMonth, '2026-10');
  assert.equal(octStats.currentMonthTotal, 900); // 500 + 400
  assert.equal(octStats.lifetimeTotal, 1400); // 200 + 300 + 500 + 400
  assert.equal(octStats.monthlyPaymentsCount, 2);
  assert.equal(octStats.totalPaymentsCount, 4);

  // When a month ends and moves to November 2026:
  // Active monthly counter resets cleanly to 0 while lifetime collection remains safe
  const novStats = calculateCustomerCollections(mockCollections, 'c1', '2026-11-01');
  assert.equal(novStats.currentMonth, '2026-11');
  assert.equal(novStats.currentMonthTotal, 0); // Active monthly counter reset!
  assert.equal(novStats.lifetimeTotal, 1400); // Lifetime safe!
  assert.equal(novStats.totalPaymentsCount, 4);
});

test('filterCustomers supports # prefix and prioritizes exact serial number jump to top', () => {
  const list = [
    { name: 'RAMESH SHRESTHA', accountNumber: '129001500', sn: 15 },
    { name: 'TAJBUN NESA KHATUN', accountNumber: '129001526', sn: 1 },
    { name: 'HARISH PANDEY', accountNumber: '129001501', sn: 101 },
  ];

  const searchHashOne = filterCustomers(list, '#1');
  assert.equal(searchHashOne.length > 0, true);
  assert.equal(searchHashOne[0].sn, 1); // Exact match jumped to top!

  const searchPlainOne = filterCustomers(list, '1');
  assert.equal(searchPlainOne[0].sn, 1); // Exact match jumped to top!
});

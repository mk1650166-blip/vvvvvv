/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CollectionItem {
  customerId: string;
  amount: number;
}

export interface CustomerStats {
  totalAmount: number;
  paidCount: number;
  unpaidCount: number;
  averagePaidAmount: number;
}

/**
 * Calculates total and summary counts for a day's collection.
 */
export function calculateDailyStats(
  entries: Record<string, number>,
  totalCustomersCount: number
): CustomerStats {
  let totalAmount = 0;
  let paidCount = 0;

  for (const customerId in entries) {
    const amt = entries[customerId];
    if (typeof amt === 'number' && amt > 0) {
      totalAmount += amt;
      paidCount++;
    }
  }

  const unpaidCount = Math.max(0, totalCustomersCount - paidCount);
  const averagePaidAmount = paidCount > 0 ? Math.round((totalAmount / paidCount) * 100) / 100 : 0;

  return {
    totalAmount,
    paidCount,
    unpaidCount,
    averagePaidAmount,
  };
}

/**
 * Formats a numeric amount to South Asian currency format (e.g., 1,50,000).
 */
export function formatCurrency(amount: number, symbol: string = 'रु'): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${symbol} 0`;
  }
  const parts = Math.round(amount).toString();
  // South Asian numbering system format (last 3 digits, then pairs of 2)
  let lastThree = parts.substring(parts.length - 3);
  const otherNumbers = parts.substring(0, parts.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  return `${symbol} ${formatted}`;
}

/**
 * Validates a 4-digit security PIN.
 */
export function validatePin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export interface CustomerCollectionSummary {
  lifetimeTotal: number;
  currentMonthTotal: number;
  currentMonth: string; // e.g. "2026-10"
  totalPaymentsCount: number;
  monthlyPaymentsCount: number;
  monthlyBreakdown: Record<string, number>; // "YYYY-MM" -> total amount
}

/**
 * Calculates a customer's lifetime total and current month collection total.
 * When a month ends, active monthly counter resets cleanly to 0 while keeping lifetime collections safe.
 */
export function calculateCustomerCollections(
  allCollections: Record<string, { date: string; entries: Record<string, number> }>,
  customerId: string,
  referenceDate?: string
): CustomerCollectionSummary {
  const ref = referenceDate || new Date().toISOString().slice(0, 10);
  const currentMonth = ref.slice(0, 7); // 'YYYY-MM'

  let lifetimeTotal = 0;
  let currentMonthTotal = 0;
  let totalPaymentsCount = 0;
  let monthlyPaymentsCount = 0;
  const monthlyBreakdown: Record<string, number> = {};

  for (const date in allCollections) {
    const record = allCollections[date];
    const amount = record?.entries?.[customerId];
    if (typeof amount === 'number' && amount > 0) {
      lifetimeTotal += amount;
      totalPaymentsCount++;

      const monthKey = date.slice(0, 7);
      monthlyBreakdown[monthKey] = (monthlyBreakdown[monthKey] || 0) + amount;

      if (monthKey === currentMonth) {
        currentMonthTotal += amount;
        monthlyPaymentsCount++;
      }
    }
  }

  return {
    lifetimeTotal,
    currentMonthTotal,
    currentMonth,
    totalPaymentsCount,
    monthlyPaymentsCount,
    monthlyBreakdown,
  };
}

/**
 * Filters customer list by search keyword (checks name, devanagari name, account number, phone, and serial number sn).
 */
export function filterCustomers<T extends { name: string; nameDevanagari?: string; accountNumber: string; phone?: string; sn?: number }>(
  customers: T[],
  searchTerm: string
): T[] {
  const cleanTerm = searchTerm.trim().toLowerCase();
  if (!cleanTerm) return customers;

  // Strip leading '#' if present (e.g. "#1" -> "1")
  const numericTerm = cleanTerm.replace(/^#/, '').trim();
  const isPureNumber = /^\d+$/.test(numericTerm);
  const targetSn = isPureNumber ? parseInt(numericTerm, 10) : null;

  const matched = customers.filter((cust) => {
    const matchName = cust.name.toLowerCase().includes(cleanTerm);
    const matchDevanagari = cust.nameDevanagari ? cust.nameDevanagari.toLowerCase().includes(cleanTerm) : false;
    const matchAcc = cust.accountNumber.toLowerCase().includes(cleanTerm);
    const matchPhone = cust.phone ? cust.phone.includes(cleanTerm) : false;
    // Allow searching directly by permanent serial number (sn) (e.g. 1, #1, 102)
    const matchSn = cust.sn !== undefined && (
      cust.sn.toString() === cleanTerm ||
      cust.sn.toString() === numericTerm ||
      cust.sn.toString().startsWith(numericTerm)
    );
    return matchName || matchDevanagari || matchAcc || matchPhone || matchSn;
  });

  // If searching by pure number or #number, prioritize exact S.N match to the very top
  if (targetSn !== null) {
    return matched.sort((a, b) => {
      if (a.sn === targetSn) return -1;
      if (b.sn === targetSn) return 1;
      return 0;
    });
  }

  return matched;
}

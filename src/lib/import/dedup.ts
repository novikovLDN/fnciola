/**
 * Дедупликация импортированных операций (§9.2, шаг Dedup).
 *
 * external_hash = хеш от (account_id + occurred_at + amount_original +
 * currency + normalized_description). Совпадения не импортируются повторно.
 */

import { createHash } from 'node:crypto';
import type { Minor } from '../money';

export interface DedupInput {
  accountId: string;
  occurredAt: string; // YYYY-MM-DD
  amountOriginal: Minor; // минорные единицы, со знаком направления
  currency: string;
  normalizedDescription: string;
}

/** Нормализация описания: схлопывание пробелов, нижний регистр, trim. */
export function normalizeDescription(raw: string): string {
  return (raw ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Детерминированный хеш строки операции для дедупликации. */
export function computeExternalHash(input: DedupInput): string {
  const parts = [
    input.accountId,
    input.occurredAt.slice(0, 10),
    String(input.amountOriginal),
    input.currency.toUpperCase(),
    normalizeDescription(input.normalizedDescription),
  ];
  return createHash('sha256').update(parts.join('␟')).digest('hex');
}

/**
 * Делит набор операций на новые и дубликаты относительно множества уже
 * существующих хешей (и дубликатов внутри самой партии).
 */
export function partitionDuplicates<T extends DedupInput>(
  rows: T[],
  existingHashes: Set<string>,
): { unique: Array<T & { externalHash: string }>; duplicates: Array<T & { externalHash: string }> } {
  const seen = new Set(existingHashes);
  const unique: Array<T & { externalHash: string }> = [];
  const duplicates: Array<T & { externalHash: string }> = [];

  for (const row of rows) {
    const externalHash = computeExternalHash(row);
    const withHash = { ...row, externalHash };
    if (seen.has(externalHash)) {
      duplicates.push(withHash);
    } else {
      seen.add(externalHash);
      unique.push(withHash);
    }
  }

  return { unique, duplicates };
}

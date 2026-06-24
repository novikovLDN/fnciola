/**
 * Браузеро-безопасная дедупликация (без node:crypto) — можно импортировать
 * в клиентских компонентах. Серверный хеш — в dedup.ts.
 */

export interface DedupKeyInput {
  accountId: string;
  occurredAt: string;
  amountOriginal: number;
  currency: string;
  normalizedDescription: string;
}

/** Нормализация описания: схлопывание пробелов, нижний регистр, trim. */
export function normalizeDescription(raw: string): string {
  return (raw ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Ключ дедупликации (та же семантика, что external_hash, но без хеширования). */
export function dedupKey(input: DedupKeyInput): string {
  return [
    input.accountId,
    input.occurredAt.slice(0, 10),
    String(input.amountOriginal),
    input.currency.toUpperCase(),
    normalizeDescription(input.normalizedDescription),
  ].join('|');
}

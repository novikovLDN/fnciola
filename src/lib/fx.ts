/**
 * Конвертация валют по курсу на дату операции (§8 ТЗ).
 *
 * Ключевые правила:
 *  - Пересчёт всегда по курсу на дату операции (`occurred_at`), не на сегодня.
 *  - Если на нужную дату курса нет — берём ближайший ПРЕДЫДУЩИЙ доступный.
 *  - Использованный курс и его дата фиксируются (`fx_rate_used`, `fx_rate_date`).
 *  - Исходная валюта и сумма никогда не теряются.
 */

import { multiplyByRate, type Minor } from './money';

export interface FxRate {
  base: string; // ISO 4217
  quote: string; // ISO 4217
  rate: number; // 1 base = rate quote
  rateDate: string; // YYYY-MM-DD
}

export interface FxConversion {
  amountMinor: Minor;
  fxRateUsed: number;
  fxRateDate: string;
}

/** Нормализация даты в YYYY-MM-DD (без времени) для сравнения. */
export function toDateKey(date: Date | string): string {
  if (typeof date === 'string') return date.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

/**
 * Поиск курса base→quote на дату или ближайшую предыдущую.
 * `rates` — доступные курсы для пары (можно передавать уже отфильтрованные).
 * Возвращает null, если подходящего курса (на дату или раньше) нет.
 */
export function findRateOnOrBefore(
  rates: FxRate[],
  base: string,
  quote: string,
  onDate: string,
): FxRate | null {
  if (base === quote) {
    return { base, quote, rate: 1, rateDate: onDate };
  }
  const candidates = rates
    .filter((r) => r.base === base && r.quote === quote && r.rateDate <= onDate)
    .sort((a, b) => (a.rateDate < b.rateDate ? 1 : -1)); // по убыванию даты
  return candidates[0] ?? null;
}

/**
 * Конвертирует сумму из валюты операции в валюту отображения по курсу на дату.
 *
 * Поддерживает кросс-курс через промежуточную валюту, если прямого нет:
 * пробует прямой base→quote, затем обратный quote→base (1/rate).
 */
export function convertOnDate(
  amountMinor: Minor,
  fromCurrency: string,
  toCurrency: string,
  occurredAt: string,
  rates: FxRate[],
): FxConversion {
  const date = toDateKey(occurredAt);

  if (fromCurrency === toCurrency) {
    return { amountMinor, fxRateUsed: 1, fxRateDate: date };
  }

  // Прямой курс from→to
  const direct = findRateOnOrBefore(rates, fromCurrency, toCurrency, date);
  if (direct) {
    return {
      amountMinor: multiplyByRate(amountMinor, direct.rate),
      fxRateUsed: direct.rate,
      fxRateDate: direct.rateDate,
    };
  }

  // Обратный курс to→from → используем 1/rate
  const inverse = findRateOnOrBefore(rates, toCurrency, fromCurrency, date);
  if (inverse && inverse.rate !== 0) {
    const rate = 1 / inverse.rate;
    return {
      amountMinor: multiplyByRate(amountMinor, rate),
      fxRateUsed: rate,
      fxRateDate: inverse.rateDate,
    };
  }

  throw new FxRateNotFoundError(fromCurrency, toCurrency, date);
}

export class FxRateNotFoundError extends Error {
  constructor(
    public readonly from: string,
    public readonly to: string,
    public readonly date: string,
  ) {
    super(`Курс ${from}→${to} на дату ${date} (или ранее) не найден`);
    this.name = 'FxRateNotFoundError';
  }
}

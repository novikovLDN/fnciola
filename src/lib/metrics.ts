/**
 * Бизнес-метрики модуля «Мой проект» (§10 ТЗ).
 *
 * Все формулы — стандартные управленческие [ЗАФИКСИРОВАНО §10.2].
 * Все суммы — в минорных единицах валюты проекта (целые числа).
 * Подаются как управленческая оценка, не бухгалтерская отчётность.
 */

import { add, subtract, sum, type Minor } from './money';

export type EntryKind = 'income' | 'expense';
export type ExpenseGroup = 'cogs' | 'opex' | 'taxes' | 'interest' | 'depreciation';
export type Recurrence = 'one_time' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface ProjectEntry {
  kind: EntryKind;
  expenseGroup?: ExpenseGroup | null; // только для расходов
  amount: Minor; // минорные единицы, всегда положительное
  recurrence: Recurrence;
  startDate: string; // YYYY-MM-DD
  endDate?: string | null; // YYYY-MM-DD, для повторяющихся
}

export interface Period {
  from: string; // YYYY-MM-DD включительно
  to: string; // YYYY-MM-DD включительно
}

export interface ProjectMetrics {
  revenue: Minor;
  cogs: Minor;
  grossProfit: Minor;
  grossMarginPct: number | null; // null = «—» при нулевой выручке
  opex: Minor;
  ebit: Minor;
  depreciation: Minor;
  ebitda: Minor;
  interest: Minor;
  taxes: Minor;
  netProfit: Minor;
  netMarginPct: number | null;
  cashFlow: Minor;
  /** Средние чистые расходы в месяц, когда расходы > доходов; иначе 0. */
  burnRate: Minor;
  /** Месяцев до исчерпания остатка; null если burn = 0 или остаток не задан. */
  runwayMonths: number | null;
}

// ---------------------------------------------------------------------------
// Развёртка повторяющихся записей по периоду
// ---------------------------------------------------------------------------

function parseDate(s: string): Date {
  // Трактуем как UTC-полночь, чтобы избежать сдвигов таймзоны.
  return new Date(`${s}T00:00:00Z`);
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + n);
  return r;
}

function addMonths(d: Date, n: number): Date {
  const r = new Date(d);
  const day = r.getUTCDate();
  r.setUTCDate(1);
  r.setUTCMonth(r.getUTCMonth() + n);
  // Сохраняем «конец месяца» корректно (31 янв + 1 мес → 28/29 фев).
  const lastDay = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + 1, 0)).getUTCDate();
  r.setUTCDate(Math.min(day, lastDay));
  return r;
}

/**
 * Возвращает список дат «срабатывания» записи, попадающих в период.
 * Для one_time — это её startDate, если он внутри периода.
 */
export function expandOccurrences(entry: ProjectEntry, period: Period): string[] {
  const periodFrom = parseDate(period.from);
  const periodTo = parseDate(period.to);
  const start = parseDate(entry.startDate);
  const end = entry.endDate ? parseDate(entry.endDate) : null;

  // Верхняя граница «жизни» записи = min(окончание записи, конец периода).
  const hardEnd = end && end < periodTo ? end : periodTo;

  if (entry.recurrence === 'one_time') {
    return start >= periodFrom && start <= periodTo ? [dateKey(start)] : [];
  }

  const occurrences: string[] = [];
  // Защита от бесконечного цикла — разумный потолок итераций.
  const maxIterations = 100_000;

  // Каждое срабатывание считаем от ОРИГИНАЛЬНОЙ даты старта по индексу k,
  // чтобы для месячных не терять «якорный» день (31 янв → 28 фев → 31 мар).
  const nth = (k: number): Date => {
    switch (entry.recurrence) {
      case 'daily':
        return addDays(start, k);
      case 'weekly':
        return addDays(start, k * 7);
      case 'monthly':
        return addMonths(start, k);
      case 'quarterly':
        return addMonths(start, k * 3);
      case 'yearly':
        return addMonths(start, k * 12);
      default:
        return addDays(start, k);
    }
  };

  for (let k = 0; k < maxIterations; k++) {
    const cursor = nth(k);
    if (cursor > hardEnd) break;
    if (cursor >= periodFrom) {
      occurrences.push(dateKey(cursor));
    }
  }

  return occurrences;
}

/** Сумма записи за период с учётом числа срабатываний. */
function entryTotalInPeriod(entry: ProjectEntry, period: Period): Minor {
  const count = expandOccurrences(entry, period).length;
  return entry.amount * count;
}

// ---------------------------------------------------------------------------
// Расчёт метрик
// ---------------------------------------------------------------------------

function pct(numerator: Minor, denominator: Minor): number | null {
  // Защита от деления на ноль (§10.2): при нулевой выручке маржа = «—» (null).
  if (denominator === 0) return null;
  return (numerator / denominator) * 100;
}

/** Число календарных месяцев в периоде (минимум 1), для усреднения burn rate. */
export function monthsInPeriod(period: Period): number {
  const from = parseDate(period.from);
  const to = parseDate(period.to);
  const months =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    (to.getUTCMonth() - from.getUTCMonth()) +
    1; // включительно
  return Math.max(1, months);
}

export interface ComputeMetricsOptions {
  /** Текущий остаток денежных средств (минорные ед.) для расчёта runway. */
  cashBalance?: Minor | null;
}

export function computeMetrics(
  entries: ProjectEntry[],
  period: Period,
  options: ComputeMetricsOptions = {},
): ProjectMetrics {
  const totals = {
    revenue: 0,
    cogs: 0,
    opex: 0,
    taxes: 0,
    interest: 0,
    depreciation: 0,
  };

  for (const entry of entries) {
    const total = entryTotalInPeriod(entry, period);
    if (total === 0) continue;

    if (entry.kind === 'income') {
      totals.revenue = add(totals.revenue, total);
    } else {
      switch (entry.expenseGroup) {
        case 'cogs':
          totals.cogs = add(totals.cogs, total);
          break;
        case 'opex':
          totals.opex = add(totals.opex, total);
          break;
        case 'taxes':
          totals.taxes = add(totals.taxes, total);
          break;
        case 'interest':
          totals.interest = add(totals.interest, total);
          break;
        case 'depreciation':
          totals.depreciation = add(totals.depreciation, total);
          break;
        default:
          // Расход без группы трактуем как OPEX (консервативно).
          totals.opex = add(totals.opex, total);
      }
    }
  }

  const revenue = totals.revenue;
  const grossProfit = subtract(revenue, totals.cogs);
  const ebit = subtract(grossProfit, totals.opex);
  const ebitda = add(ebit, totals.depreciation);
  const netProfit = subtract(subtract(ebit, totals.interest), totals.taxes);

  // Cash flow (кассовый): поступления − выплаты за период.
  // Амортизация — неденежная статья, в кассовый поток НЕ входит.
  const cashOutflows = sum([totals.cogs, totals.opex, totals.taxes, totals.interest]);
  const cashFlow = subtract(revenue, cashOutflows);

  // Burn rate: средние чистые расходы в месяц, только когда расходы > доходов.
  const months = monthsInPeriod(period);
  const netSpend = subtract(cashOutflows, revenue); // >0 если тратим больше, чем зарабатываем
  const burnRate = netSpend > 0 ? Math.round(netSpend / months) : 0;

  // Runway: остаток / burn rate (в месяцах), только когда burn > 0.
  let runwayMonths: number | null = null;
  if (burnRate > 0 && options.cashBalance != null && options.cashBalance > 0) {
    runwayMonths = options.cashBalance / burnRate;
  }

  return {
    revenue,
    cogs: totals.cogs,
    grossProfit,
    grossMarginPct: pct(grossProfit, revenue),
    opex: totals.opex,
    ebit,
    depreciation: totals.depreciation,
    ebitda,
    interest: totals.interest,
    taxes: totals.taxes,
    netProfit,
    netMarginPct: pct(netProfit, revenue),
    cashFlow,
    burnRate,
    runwayMonths,
  };
}

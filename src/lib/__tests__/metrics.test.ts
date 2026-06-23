import { describe, it, expect } from 'vitest';
import { computeMetrics, expandOccurrences, monthsInPeriod, type ProjectEntry } from '../metrics';

const period = { from: '2026-01-01', to: '2026-12-31' };

describe('metrics — развёртка повторяющихся записей (§10.1)', () => {
  it('one_time попадает в период по дате', () => {
    const e: ProjectEntry = { kind: 'income', amount: 100, recurrence: 'one_time', startDate: '2026-03-15' };
    expect(expandOccurrences(e, period)).toEqual(['2026-03-15']);
    expect(expandOccurrences(e, { from: '2026-04-01', to: '2026-12-31' })).toEqual([]);
  });

  it('monthly разворачивается на 12 срабатываний за год', () => {
    const e: ProjectEntry = { kind: 'expense', expenseGroup: 'opex', amount: 100, recurrence: 'monthly', startDate: '2026-01-01' };
    expect(expandOccurrences(e, period)).toHaveLength(12);
  });

  it('monthly с концом ограничивается endDate', () => {
    const e: ProjectEntry = { kind: 'expense', expenseGroup: 'opex', amount: 100, recurrence: 'monthly', startDate: '2026-01-01', endDate: '2026-03-31' };
    expect(expandOccurrences(e, period)).toHaveLength(3);
  });

  it('weekly считает недели в периоде', () => {
    const e: ProjectEntry = { kind: 'income', amount: 100, recurrence: 'weekly', startDate: '2026-01-01' };
    // 2026-01-01 .. 2026-01-29 = 5 срабатываний (1,8,15,22,29)
    expect(expandOccurrences(e, { from: '2026-01-01', to: '2026-01-29' })).toHaveLength(5);
  });

  it('monthly корректно обрабатывает конец месяца (31 янв)', () => {
    const e: ProjectEntry = { kind: 'income', amount: 100, recurrence: 'monthly', startDate: '2026-01-31' };
    const occ = expandOccurrences(e, { from: '2026-01-01', to: '2026-03-31' });
    // янв 31, фев 28, мар 31 (не «перескакивает» в марте)
    expect(occ).toEqual(['2026-01-31', '2026-02-28', '2026-03-31']);
  });

  it('monthsInPeriod включительно', () => {
    expect(monthsInPeriod({ from: '2026-01-01', to: '2026-12-31' })).toBe(12);
    expect(monthsInPeriod({ from: '2026-06-01', to: '2026-06-30' })).toBe(1);
  });
});

describe('metrics — управленческие формулы (§10.2, контрольный пример)', () => {
  // Контрольный пример (суммы в минорных единицах, например копейках):
  // Выручка 1 000 000; COGS 400 000; OPEX 200 000; Амортизация 50 000;
  // Проценты 30 000; Налоги 70 000.
  const entries: ProjectEntry[] = [
    { kind: 'income', amount: 1_000_000, recurrence: 'one_time', startDate: '2026-06-01' },
    { kind: 'expense', expenseGroup: 'cogs', amount: 400_000, recurrence: 'one_time', startDate: '2026-06-02' },
    { kind: 'expense', expenseGroup: 'opex', amount: 200_000, recurrence: 'one_time', startDate: '2026-06-03' },
    { kind: 'expense', expenseGroup: 'depreciation', amount: 50_000, recurrence: 'one_time', startDate: '2026-06-04' },
    { kind: 'expense', expenseGroup: 'interest', amount: 30_000, recurrence: 'one_time', startDate: '2026-06-05' },
    { kind: 'expense', expenseGroup: 'taxes', amount: 70_000, recurrence: 'one_time', startDate: '2026-06-06' },
  ];

  const m = computeMetrics(entries, period, { cashBalance: 0 });

  it('Revenue = сумма доходов', () => expect(m.revenue).toBe(1_000_000));
  it('Gross Profit = Revenue − COGS', () => expect(m.grossProfit).toBe(600_000));
  it('Валовая маржа % = 60', () => expect(m.grossMarginPct).toBeCloseTo(60));
  it('EBIT = Gross − OPEX', () => expect(m.ebit).toBe(400_000));
  it('EBITDA = EBIT + Depreciation', () => expect(m.ebitda).toBe(450_000));
  it('Net Profit = EBIT − Interest − Taxes', () => expect(m.netProfit).toBe(300_000));
  it('Чистая маржа % = 30', () => expect(m.netMarginPct).toBeCloseTo(30));
  it('Cash Flow = поступления − выплаты (амортизация не в кэше)', () => {
    // 1 000 000 − (400 000 + 200 000 + 70 000 + 30 000) = 300 000
    expect(m.cashFlow).toBe(300_000);
  });
  it('burn = 0, runway = null (доходы > расходов)', () => {
    expect(m.burnRate).toBe(0);
    expect(m.runwayMonths).toBeNull();
  });
});

describe('metrics — burn rate и runway (§10.2)', () => {
  it('считает burn rate как средние чистые расходы в месяц', () => {
    const entries: ProjectEntry[] = [
      { kind: 'income', amount: 100_000, recurrence: 'one_time', startDate: '2026-01-15' },
      { kind: 'expense', expenseGroup: 'opex', amount: 1_300_000, recurrence: 'one_time', startDate: '2026-01-20' },
    ];
    const p = { from: '2026-01-01', to: '2026-12-31' }; // 12 месяцев
    const m = computeMetrics(entries, p, { cashBalance: 6_000_000 });
    // netSpend = 1 300 000 − 100 000 = 1 200 000 / 12 = 100 000 в месяц
    expect(m.burnRate).toBe(100_000);
    // runway = 6 000 000 / 100 000 = 60 месяцев
    expect(m.runwayMonths).toBeCloseTo(60);
  });
});

describe('metrics — защита от деления на ноль (§10.2)', () => {
  it('при нулевой выручке маржа = null (UI покажет «—»)', () => {
    const entries: ProjectEntry[] = [
      { kind: 'expense', expenseGroup: 'opex', amount: 50_000, recurrence: 'one_time', startDate: '2026-06-01' },
    ];
    const m = computeMetrics(entries, period);
    expect(m.revenue).toBe(0);
    expect(m.grossMarginPct).toBeNull();
    expect(m.netMarginPct).toBeNull();
  });
});

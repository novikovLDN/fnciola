import { describe, it, expect } from 'vitest';
import { convertOnDate, findRateOnOrBefore, FxRateNotFoundError, type FxRate } from '../fx';

const rates: FxRate[] = [
  { base: 'USD', quote: 'RUB', rate: 90, rateDate: '2026-06-01' },
  { base: 'USD', quote: 'RUB', rate: 92, rateDate: '2026-06-10' },
  { base: 'USD', quote: 'RUB', rate: 95, rateDate: '2026-06-20' },
  { base: 'EUR', quote: 'RUB', rate: 100, rateDate: '2026-06-15' },
];

describe('fx — пересчёт по курсу на дату операции (§8)', () => {
  it('берёт курс ровно на дату, если он есть', () => {
    const r = convertOnDate(10000, 'USD', 'RUB', '2026-06-10', rates);
    expect(r.fxRateUsed).toBe(92);
    expect(r.fxRateDate).toBe('2026-06-10');
    expect(r.amountMinor).toBe(920000); // 100.00 USD → 920.00 RUB
  });

  it('берёт ближайший ПРЕДЫДУЩИЙ курс, если на дату нет', () => {
    // 2026-06-12 → ближайший предыдущий = 2026-06-10 (92)
    const r = convertOnDate(10000, 'USD', 'RUB', '2026-06-12', rates);
    expect(r.fxRateUsed).toBe(92);
    expect(r.fxRateDate).toBe('2026-06-10');
  });

  it('не теряет оригинал при равных валютах (rate=1)', () => {
    const r = convertOnDate(12345, 'RUB', 'RUB', '2026-06-12', rates);
    expect(r.amountMinor).toBe(12345);
    expect(r.fxRateUsed).toBe(1);
  });

  it('использует обратный курс, если прямого нет', () => {
    // нет RUB→USD напрямую, есть USD→RUB=92 → 1/92
    const r = convertOnDate(920000, 'RUB', 'USD', '2026-06-10', rates);
    expect(r.amountMinor).toBe(10000); // 920.00 RUB → 100.00 USD
  });

  it('бросает FxRateNotFoundError, если курса нет даже раньше', () => {
    expect(() => convertOnDate(10000, 'USD', 'RUB', '2026-05-01', rates)).toThrow(FxRateNotFoundError);
  });

  it('findRateOnOrBefore сортирует по убыванию даты', () => {
    const r = findRateOnOrBefore(rates, 'USD', 'RUB', '2026-06-25');
    expect(r?.rateDate).toBe('2026-06-20');
    expect(r?.rate).toBe(95);
  });
});

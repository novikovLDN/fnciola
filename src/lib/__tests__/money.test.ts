import { describe, it, expect } from 'vitest';
import {
  add,
  subtract,
  sum,
  roundHalfUp,
  multiplyByRate,
  parseMajorToMinor,
  formatMoney,
  signOf,
} from '../money';

describe('money — целочисленная арифметика (§5.2)', () => {
  it('складывает и вычитает минорные единицы', () => {
    expect(add(10050, 4950)).toBe(15000);
    expect(subtract(10000, 2550)).toBe(7450);
    expect(sum([100, 200, 300])).toBe(600);
  });

  it('бросает при не-целом вводе (защита от float)', () => {
    expect(() => add(10.5, 1)).toThrow();
    expect(() => subtract(1, 0.1)).toThrow();
  });

  it('round half-up симметричен относительно нуля', () => {
    expect(roundHalfUp(0.5)).toBe(1);
    expect(roundHalfUp(-0.5)).toBe(-1);
    expect(roundHalfUp(2.4)).toBe(2);
    expect(roundHalfUp(2.5)).toBe(3);
  });

  it('умножает на курс с округлением до целых минорных единиц', () => {
    // 100.00 USD * 92.5 = 9250.00 RUB → 925000 копеек
    expect(multiplyByRate(10000, 92.5)).toBe(925000);
    // округление: 333 коп * 1.005 = 334.665 → 335
    expect(multiplyByRate(333, 1.005)).toBe(335);
  });

  it('парсит мажорный ввод в минорные единицы', () => {
    expect(parseMajorToMinor('199', 'RUB')).toBe(19900);
    expect(parseMajorToMinor('1490,50', 'RUB')).toBe(149050);
    expect(parseMajorToMinor('1 234.56', 'USD')).toBe(123456);
    // JPY без минорных единиц
    expect(parseMajorToMinor('1000', 'JPY')).toBe(1000);
    // BHD — нет в справочнике, дефолт 2 знака
    expect(parseMajorToMinor('10.99', 'XXX')).toBe(1099);
  });

  it('форматирует деньги по локали и валюте', () => {
    const rub = formatMoney(149050, 'RUB');
    expect(rub).toContain('1');
    expect(rub).toContain('490');
    // знак для прибыли/убытка
    expect(formatMoney(-5000, 'RUB', { showSign: true })).toMatch(/^-|−/);
  });

  it('signOf даёт семантический знак для доступности', () => {
    expect(signOf(100)).toBe('positive');
    expect(signOf(-100)).toBe('negative');
    expect(signOf(0)).toBe('zero');
  });
});

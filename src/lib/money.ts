/**
 * Денежная арифметика на целых числах (§5.2 ТЗ).
 *
 * ПРИНЦИП: суммы хранятся и считаются в МИНОРНЫХ единицах валюты как целые
 * числа (`bigint` в БД, `number`-целое в рантайме для типичных диапазонов).
 * Никаких `float` для денег. Все операции — сложение/вычитание целых,
 * умножение на курс — с явным округлением half-up.
 *
 * Тип `Minor` — это целое число минорных единиц (например, копеек).
 */

import { getCurrency } from './currencies';

export type Minor = number;

/** Бросает, если значение не безопасное целое (защита от float-ошибок). */
function assertInteger(value: number, ctx: string): void {
  if (!Number.isInteger(value)) {
    throw new Error(`money: ожидалось целое число минорных единиц в ${ctx}, получено ${value}`);
  }
  if (!Number.isSafeInteger(value)) {
    throw new Error(`money: значение выходит за пределы безопасного целого в ${ctx}: ${value}`);
  }
}

/** Сложение сумм (обе в минорных единицах одной валюты). */
export function add(a: Minor, b: Minor): Minor {
  assertInteger(a, 'add.a');
  assertInteger(b, 'add.b');
  return a + b;
}

/** Вычитание. */
export function subtract(a: Minor, b: Minor): Minor {
  assertInteger(a, 'subtract.a');
  assertInteger(b, 'subtract.b');
  return a - b;
}

/** Сумма массива минорных значений. */
export function sum(values: Minor[]): Minor {
  return values.reduce((acc, v) => add(acc, v), 0);
}

/**
 * Округление до целого по правилу half-up (от нуля для отрицательных —
 * симметрично), чтобы 0.5 → 1, -0.5 → -1. Явное правило округления (§5.2).
 */
export function roundHalfUp(value: number): number {
  return Math.sign(value) * Math.round(Math.abs(value));
}

/**
 * Умножение суммы на коэффициент (например, курс валют) с округлением
 * результата до целых минорных единиц. Используется в FX-пересчёте (§8).
 */
export function multiplyByRate(amountMinor: Minor, rate: number): Minor {
  assertInteger(amountMinor, 'multiplyByRate.amount');
  if (!Number.isFinite(rate) || rate < 0) {
    throw new Error(`money: некорректный курс ${rate}`);
  }
  return roundHalfUp(amountMinor * rate);
}

/**
 * Парсинг пользовательского ввода (строка/число мажорных единиц) в минорные.
 * Поддерживает запятую и точку как разделитель, пробелы как разделитель тысяч.
 * Округляет до точности валюты.
 */
export function parseMajorToMinor(input: string | number, currency: string): Minor {
  const { decimals } = getCurrency(currency);
  let normalized: string;
  if (typeof input === 'number') {
    if (!Number.isFinite(input)) throw new Error('money: нечисловой ввод');
    normalized = input.toFixed(decimals + 2); // запас, потом округлим
  } else {
    normalized = input
      .trim()
      .replace(/\s/g, '')
      .replace(/ /g, '')
      .replace(',', '.');
  }
  if (normalized === '' || normalized === '-' || normalized === '.') {
    throw new Error('money: пустой ввод суммы');
  }
  const value = Number(normalized);
  if (!Number.isFinite(value)) {
    throw new Error(`money: не удалось разобрать сумму "${input}"`);
  }
  const factor = 10 ** decimals;
  return roundHalfUp(value * factor);
}

/**
 * Группировка разрядов для живого ввода суммы: "85655" → "85 655",
 * "1234567,8" → "1 234 567,8". Возвращает строку для отображения в поле ввода;
 * для парсинга используйте «сырое» значение (parseMajorToMinor сам убирает пробелы).
 */
export function groupAmountInput(raw: string): string {
  if (!raw) return '';
  const cleaned = raw.replace(/\s/g, '').replace(/[^\d.,]/g, '');
  const m = cleaned.match(/^(\d*)([.,]?)(\d*)/);
  if (!m) return cleaned;
  const intPart = m[1].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return intPart + m[2] + m[3];
}

/** Перевод минорных единиц в мажорное число (для расчётов отображения). */
export function minorToMajorNumber(amountMinor: Minor, currency: string): number {
  assertInteger(amountMinor, 'minorToMajorNumber');
  const { decimals } = getCurrency(currency);
  return amountMinor / 10 ** decimals;
}

/**
 * Форматирование суммы для UI по локали и валюте (Intl, §17).
 * tabular-nums обеспечивается на уровне CSS (см. globals.css).
 */
export function formatMoney(
  amountMinor: Minor,
  currency: string,
  opts: { locale?: string; showSign?: boolean; currencyDisplay?: 'symbol' | 'code' | 'none' } = {},
): string {
  const { locale = 'ru-RU', showSign = false, currencyDisplay = 'symbol' } = opts;
  const meta = getCurrency(currency);
  const major = minorToMajorNumber(amountMinor, currency);

  const formatter = new Intl.NumberFormat(locale, {
    ...(currencyDisplay === 'none'
      ? { style: 'decimal' }
      : { style: 'currency', currency: meta.code, currencyDisplay: currencyDisplay === 'code' ? 'code' : 'symbol' }),
    minimumFractionDigits: meta.decimals,
    maximumFractionDigits: meta.decimals,
    signDisplay: showSign ? 'always' : 'auto',
  });

  return formatter.format(major);
}

/**
 * Компактное форматирование крупных сумм (тыс./млн/млрд) — чтобы большие
 * значения не вылезали за карточки. Мелкие суммы показываются полностью.
 */
export function formatCompactMoney(
  amountMinor: Minor,
  currency: string,
  opts: { locale?: string; showSign?: boolean } = {},
): string {
  const { locale = 'ru-RU', showSign = false } = opts;
  const meta = getCurrency(currency);
  const major = minorToMajorNumber(amountMinor, currency);
  const abs = Math.abs(major);

  const sign = major < 0 ? '−' : showSign ? '+' : '';
  const sym = meta.symbol;

  const compact = (n: number, suffix: string) => {
    const v = new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);
    return `${sign}${v} ${suffix} ${sym}`.trim();
  };

  if (abs >= 1_000_000_000) return compact(abs / 1_000_000_000, 'млрд');
  if (abs >= 1_000_000) return compact(abs / 1_000_000, 'млн');
  if (abs >= 100_000) return compact(abs / 1_000, 'тыс.');
  // мелкие — обычное форматирование
  return formatMoney(amountMinor, currency, { locale, showSign });
}

/**
 * Знак суммы как семантический ярлык — для доступности (§5.2, §14.2):
 * прибыль/убыток различаем НЕ только цветом.
 */
export type Sign = 'positive' | 'negative' | 'zero';

export function signOf(amountMinor: Minor): Sign {
  if (amountMinor > 0) return 'positive';
  if (amountMinor < 0) return 'negative';
  return 'zero';
}

/**
 * Парсер CSV-выписок (§9, MVP-формат [ЗАФИКСИРОВАНО]).
 *
 * Лёгкий устойчивый парсер: поддержка кавычек, экранированных кавычек,
 * запятой/точки-с-запятой/таба как разделителя, эвристическое сопоставление
 * колонок (дата/сумма/валюта/описание/мерчант) для типичных банковских CSV.
 *
 * Возвращает «сырые» нормализованные строки; дальнейшая нормализация сумм в
 * минорные единицы и дедуп — на следующих шагах пайплайна.
 */

import { parseMajorToMinor, type Minor } from '../money';

export interface RawTransaction {
  occurredAt: string; // YYYY-MM-DD
  amountOriginal: Minor; // минорные единицы, знак = направление
  currencyOriginal: string;
  direction: 'income' | 'expense';
  description: string;
  merchantRaw: string;
}

export interface CsvParseResult {
  rows: RawTransaction[];
  errors: Array<{ line: number; message: string }>;
  detectedDelimiter: string;
}

/** Разбор одной CSV-строки с учётом кавычек (RFC 4180-подобно). */
export function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      result.push(field);
      field = '';
    } else {
      field += char;
    }
  }
  result.push(field);
  return result;
}

function detectDelimiter(headerLine: string): string {
  const candidates = [';', '\t', ','];
  let best = ',';
  let bestCount = -1;
  for (const d of candidates) {
    const count = headerLine.split(d).length;
    if (count > bestCount) {
      bestCount = count;
      best = d;
    }
  }
  return best;
}

const DATE_HINTS = ['дата', 'date', 'дата операции', 'transaction date', 'дата проводки'];
const AMOUNT_HINTS = ['сумма', 'amount', 'оборот', 'value'];
const DEBIT_HINTS = ['расход', 'debit', 'списание'];
const CREDIT_HINTS = ['доход', 'credit', 'поступление', 'зачисление'];
const CURRENCY_HINTS = ['валюта', 'currency', 'ccy'];
const DESC_HINTS = ['описание', 'назначение', 'description', 'details', 'назначение платежа'];
const MERCHANT_HINTS = ['мерчант', 'merchant', 'получатель', 'контрагент', 'payee'];

function findColumn(headers: string[], hints: string[]): number {
  const lower = headers.map((h) => h.toLowerCase().trim());
  // Точное совпадение приоритетнее частичного.
  for (const hint of hints) {
    const exact = lower.indexOf(hint);
    if (exact !== -1) return exact;
  }
  for (let i = 0; i < lower.length; i++) {
    if (hints.some((hint) => lower[i].includes(hint))) return i;
  }
  return -1;
}

/** Нормализация даты к YYYY-MM-DD из частых форматов. */
export function normalizeDate(raw: string): string | null {
  const s = raw.trim();
  // ISO
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  // DD.MM.YYYY или DD/MM/YYYY
  m = s.match(/^(\d{2})[./](\d{2})[./](\d{4})/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  // DD.MM.YY
  m = s.match(/^(\d{2})[./](\d{2})[./](\d{2})$/);
  if (m) return `20${m[3]}-${m[2]}-${m[1]}`;
  return null;
}

export function parseCsv(content: string, defaultCurrency: string): CsvParseResult {
  const errors: CsvParseResult['errors'] = [];
  const rows: RawTransaction[] = [];

  const lines = content
    .replace(/^﻿/, '') // BOM
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '');

  if (lines.length < 2) {
    return { rows, errors: [{ line: 0, message: 'Файл пуст или без данных' }], detectedDelimiter: ',' };
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCsvLine(lines[0], delimiter);

  const idxDate = findColumn(headers, DATE_HINTS);
  const idxAmount = findColumn(headers, AMOUNT_HINTS);
  const idxDebit = findColumn(headers, DEBIT_HINTS);
  const idxCredit = findColumn(headers, CREDIT_HINTS);
  const idxCurrency = findColumn(headers, CURRENCY_HINTS);
  const idxDesc = findColumn(headers, DESC_HINTS);
  const idxMerchant = findColumn(headers, MERCHANT_HINTS);

  if (idxDate === -1) {
    errors.push({ line: 1, message: 'Не найдена колонка с датой' });
  }
  if (idxAmount === -1 && idxDebit === -1 && idxCredit === -1) {
    errors.push({ line: 1, message: 'Не найдена колонка с суммой' });
  }
  if (errors.length) {
    return { rows, errors, detectedDelimiter: delimiter };
  }

  for (let i = 1; i < lines.length; i++) {
    const lineNo = i + 1;
    try {
      const cols = parseCsvLine(lines[i], delimiter);
      const dateRaw = idxDate >= 0 ? cols[idxDate] ?? '' : '';
      const occurredAt = normalizeDate(dateRaw);
      if (!occurredAt) {
        errors.push({ line: lineNo, message: `Не распознана дата "${dateRaw}"` });
        continue;
      }

      const currency = (idxCurrency >= 0 ? cols[idxCurrency]?.trim() : '') || defaultCurrency;

      let amountMinor: Minor;
      let direction: 'income' | 'expense';

      if (idxAmount >= 0) {
        const rawAmount = (cols[idxAmount] ?? '').trim();
        const signedMinor = parseSignedAmount(rawAmount, currency);
        direction = signedMinor >= 0 ? 'income' : 'expense';
        amountMinor = signedMinor;
      } else {
        // Раздельные колонки дебет/кредит.
        const debit = idxDebit >= 0 ? safeParse(cols[idxDebit], currency) : 0;
        const credit = idxCredit >= 0 ? safeParse(cols[idxCredit], currency) : 0;
        if (credit > 0) {
          direction = 'income';
          amountMinor = credit;
        } else {
          direction = 'expense';
          amountMinor = -Math.abs(debit);
        }
      }

      const description = (idxDesc >= 0 ? cols[idxDesc] : '')?.trim() ?? '';
      const merchantRaw = (idxMerchant >= 0 ? cols[idxMerchant] : '')?.trim() ?? '';

      rows.push({
        occurredAt,
        amountOriginal: amountMinor,
        currencyOriginal: currency.toUpperCase(),
        direction,
        description,
        merchantRaw,
      });
    } catch (err) {
      errors.push({ line: lineNo, message: err instanceof Error ? err.message : 'Ошибка разбора строки' });
    }
  }

  return { rows, errors, detectedDelimiter: delimiter };
}

function parseSignedAmount(raw: string, currency: string): Minor {
  const negative = /^-/.test(raw.trim()) || /\(.*\)/.test(raw);
  const cleaned = raw.replace(/[()]/g, '').replace(/[+]/g, '');
  const minor = parseMajorToMinor(cleaned.replace('-', ''), currency);
  return negative ? -minor : minor;
}

function safeParse(raw: string | undefined, currency: string): Minor {
  if (!raw || raw.trim() === '') return 0;
  try {
    return parseMajorToMinor(raw, currency);
  } catch {
    return 0;
  }
}

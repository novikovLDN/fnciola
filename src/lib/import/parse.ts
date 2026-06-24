/**
 * Оркестратор импорта: определяет формат файла и разбирает в список «сырых»
 * операций. Парсинг идёт В БРАУЗЕРЕ — сырой файл никуда не загружается (приватно).
 */
import { parseCsv, type RawTransaction } from './csv';
import { parseOfx } from './ofx';
import { parseCamt053 } from './camt053';
import { parseMt940 } from './mt940';

export type ImportFormat = 'csv' | 'xlsx' | 'ofx' | 'camt053' | 'mt940' | 'pdf';

export interface ParseFileResult {
  format: ImportFormat;
  rows: RawTransaction[];
  errors: Array<{ line: number; message: string }>;
}

export async function parseFile(file: File, defaultCurrency = 'RUB'): Promise<ParseFileResult> {
  const name = file.name.toLowerCase();
  const ext = name.includes('.') ? name.slice(name.lastIndexOf('.') + 1) : '';

  // PDF — через pdf.js (бета): извлекаем текст и распознаём операции.
  if (ext === 'pdf') {
    const buf = await file.arrayBuffer();
    const { parsePdf } = await import('./pdf');
    const res = await parsePdf(buf, defaultCurrency);
    return { format: 'pdf', rows: res.rows, errors: res.errors };
  }

  // XLSX/XLS — через SheetJS, конвертируем первый лист в CSV и переиспользуем парсер.
  if (ext === 'xlsx' || ext === 'xls') {
    const buf = await file.arrayBuffer();
    const XLSX = await import('xlsx');
    const wb = XLSX.read(buf, { type: 'array' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const csv = XLSX.utils.sheet_to_csv(sheet, { FS: ';' });
    const res = parseCsv(csv, defaultCurrency);
    return { format: 'xlsx', rows: res.rows, errors: res.errors };
  }

  const text = await file.text();

  if (ext === 'ofx' || ext === 'qfx' || /<OFX>/i.test(text) || /<STMTTRN>/i.test(text)) {
    const res = parseOfx(text, defaultCurrency);
    return { format: 'ofx', rows: res.rows, errors: res.errors };
  }
  if (ext === 'xml' || (/<Document[\s>]/i.test(text) && /<Ntry\b/.test(text))) {
    const res = parseCamt053(text, defaultCurrency);
    return { format: 'camt053', rows: res.rows, errors: res.errors };
  }
  if (ext === 'sta' || ext === 'mt940' || /^:20:/m.test(text) || /^:61:/m.test(text)) {
    const res = parseMt940(text, defaultCurrency);
    return { format: 'mt940', rows: res.rows, errors: res.errors };
  }

  // По умолчанию — CSV.
  const res = parseCsv(text, defaultCurrency);
  return { format: 'csv', rows: res.rows, errors: res.errors };
}

export const ACCEPTED_EXTENSIONS = '.csv,.txt,.xlsx,.xls,.ofx,.qfx,.xml,.sta,.mt940,.pdf';

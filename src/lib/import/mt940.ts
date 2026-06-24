/**
 * Базовый парсер MT940 (SWIFT). Разбирает строки :61: (транзакция) и
 * :86: (назначение). Достаточно для типовых банковских выписок.
 */
import { parseMajorToMinor } from '../money';
import type { RawTransaction, CsvParseResult } from './csv';

export function parseMt940(content: string, defaultCurrency: string): CsvParseResult {
  const rows: RawTransaction[] = [];
  const errors: CsvParseResult['errors'] = [];
  const lines = content.split(/\r?\n/);
  const currency = (content.match(/:60[FM]:[A-Z]([A-Z]{3})/)?.[1] || defaultCurrency).toUpperCase();

  let current: RawTransaction | null = null;
  let lineNo = 0;

  for (const line of lines) {
    lineNo++;
    const m = line.match(/^:61:(\d{6})(\d{4})?(R?[DC])([0-9.,]+)/);
    if (m) {
      if (current) rows.push(current);
      try {
        const [, ymd, , mark, amountRaw] = m;
        const year = 2000 + Number(ymd.slice(0, 2));
        const occurredAt = `${year}-${ymd.slice(2, 4)}-${ymd.slice(4, 6)}`;
        const minor = parseMajorToMinor(amountRaw, currency);
        const isExpense = /D/.test(mark);
        current = {
          occurredAt,
          amountOriginal: isExpense ? -minor : minor,
          currencyOriginal: currency,
          direction: isExpense ? 'expense' : 'income',
          description: '',
          merchantRaw: '',
        };
      } catch (e) {
        errors.push({ line: lineNo, message: e instanceof Error ? e.message : 'MT940: ошибка :61:' });
        current = null;
      }
      continue;
    }
    const desc = line.match(/^:86:(.*)$/);
    if (desc && current) {
      const text = desc[1].replace(/\?\d{2}/g, ' ').replace(/\s+/g, ' ').trim();
      current.description = text;
      current.merchantRaw = text;
    }
  }
  if (current) rows.push(current);

  if (rows.length === 0) errors.push({ line: 0, message: 'MT940: транзакции :61: не найдены' });
  return { rows, errors, detectedDelimiter: '' };
}

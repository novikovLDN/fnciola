/**
 * Парсер CAMT.053 (ISO 20022 банковская выписка, XML). Регекс-извлечение
 * записей <Ntry>, чтобы не зависеть от DOMParser (работает и в node).
 */
import { parseMajorToMinor } from '../money';
import type { RawTransaction, CsvParseResult } from './csv';

function pick(block: string, re: RegExp): string | undefined {
  return block.match(re)?.[1]?.trim();
}

export function parseCamt053(content: string, defaultCurrency: string): CsvParseResult {
  const rows: RawTransaction[] = [];
  const errors: CsvParseResult['errors'] = [];

  const blocks = content.match(/<Ntry\b[\s\S]*?<\/Ntry>/g) || [];
  if (blocks.length === 0) {
    return { rows, errors: [{ line: 0, message: 'CAMT.053: записи <Ntry> не найдены' }], detectedDelimiter: '' };
  }

  blocks.forEach((block, i) => {
    try {
      const amtStr = pick(block, /<Amt[^>]*>([\d.,]+)<\/Amt>/);
      const ccy = (pick(block, /<Amt[^>]*Ccy="([A-Z]{3})"/) || defaultCurrency).toUpperCase();
      const ind = pick(block, /<CdtDbtInd>(CRDT|DBIT)<\/CdtDbtInd>/i);
      const date =
        pick(block, /<BookgDt>[\s\S]*?<Dt>([\d-]+)<\/Dt>/) ||
        pick(block, /<ValDt>[\s\S]*?<Dt>([\d-]+)<\/Dt>/);
      const desc =
        pick(block, /<Ustrd>([^<]+)<\/Ustrd>/) ||
        pick(block, /<AddtlNtryInf>([^<]+)<\/AddtlNtryInf>/) ||
        pick(block, /<Nm>([^<]+)<\/Nm>/) ||
        '';

      if (!amtStr || !date) {
        errors.push({ line: i + 1, message: 'CAMT.053: пропущена сумма или дата' });
        return;
      }
      const minor = parseMajorToMinor(amtStr, ccy);
      const isExpense = (ind || 'DBIT').toUpperCase() === 'DBIT';
      rows.push({
        occurredAt: date.slice(0, 10),
        amountOriginal: isExpense ? -minor : minor,
        currencyOriginal: ccy,
        direction: isExpense ? 'expense' : 'income',
        description: desc.trim(),
        merchantRaw: desc.trim(),
      });
    } catch (e) {
      errors.push({ line: i + 1, message: e instanceof Error ? e.message : 'CAMT.053: ошибка записи' });
    }
  });

  return { rows, errors, detectedDelimiter: '' };
}

/**
 * Парсер OFX/QFX (Open Financial Exchange). SGML-теги часто не закрываются,
 * поэтому извлекаем значения построчно по открывающему тегу.
 */
import { parseMajorToMinor } from '../money';
import type { RawTransaction, CsvParseResult } from './csv';

function tag(block: string, name: string): string | undefined {
  const m = block.match(new RegExp(`<${name}>([^<\\r\\n]+)`, 'i'));
  return m?.[1]?.trim();
}

function ofxDate(raw: string | undefined): string | null {
  if (!raw) return null;
  const m = raw.match(/^(\d{4})(\d{2})(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

export function parseOfx(content: string, defaultCurrency: string): CsvParseResult {
  const rows: RawTransaction[] = [];
  const errors: CsvParseResult['errors'] = [];
  const currency = (content.match(/<CURDEF>([A-Z]{3})/i)?.[1] || defaultCurrency).toUpperCase();

  // Делим на блоки транзакций (учитываем как закрытые, так и SGML-варианты).
  const parts = content.split(/<STMTTRN>/i).slice(1);
  if (parts.length === 0) {
    return { rows, errors: [{ line: 0, message: 'OFX: транзакции не найдены' }], detectedDelimiter: '' };
  }

  parts.forEach((block, i) => {
    try {
      const occurredAt = ofxDate(tag(block, 'DTPOSTED') || tag(block, 'DTUSER'));
      const amtRaw = tag(block, 'TRNAMT');
      if (!occurredAt || !amtRaw) {
        errors.push({ line: i + 1, message: 'OFX: пропущена дата или сумма' });
        return;
      }
      const negative = amtRaw.trim().startsWith('-');
      const minor = parseMajorToMinor(amtRaw.replace('-', '').replace('+', ''), currency);
      const description = (tag(block, 'NAME') || tag(block, 'MEMO') || '').trim();
      const merchantRaw = (tag(block, 'NAME') || '').trim();
      rows.push({
        occurredAt,
        amountOriginal: negative ? -minor : minor,
        currencyOriginal: currency,
        direction: negative ? 'expense' : 'income',
        description,
        merchantRaw,
      });
    } catch (e) {
      errors.push({ line: i + 1, message: e instanceof Error ? e.message : 'OFX: ошибка строки' });
    }
  });

  return { rows, errors, detectedDelimiter: '' };
}

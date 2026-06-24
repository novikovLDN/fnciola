/**
 * Парсер PDF-выписок (бета). Извлекает текст постранично через pdf.js,
 * собирает визуальные строки и распознаёт операции: строка начинается с даты
 * и заканчивается суммой (напр. «-5 074,00 RUR»); перенос описания на след.
 * строку приклеивается к предыдущей операции.
 *
 * Работает в браузере — сырой файл никуда не загружается (приватность, §6).
 */
import { parseMajorToMinor } from '../money';
import type { RawTransaction, CsvParseResult } from './csv';

const DATE = /^(\d{2})\.(\d{2})\.(\d{4})\b/;
// сумма в конце строки: знак, разряды через пробелы, запятая/точка, валюта
const AMT = /(-?\d[\d  ]*[.,]\d{2})\s*(?:RUR|RUB|₽|руб\.?)\s*$/i;
const FOOTER = /АЛЬФА-БАНК|Страница|подпись|лицензия|БИК|ОГРН|www\.|Выписка по счету|Операции по счету|Дата проводки|в валюте счета|Входящий остаток|Исходящий остаток/i;

export async function parsePdf(data: ArrayBuffer, defaultCurrency: string): Promise<CsvParseResult> {
  const errors: CsvParseResult['errors'] = [];
  const rows: RawTransaction[] = [];

  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const doc = await pdfjs.getDocument({ data: new Uint8Array(data), useSystemFonts: true, isEvalSupported: false }).promise;

  // Собираем визуальные строки по всем страницам.
  const lines: string[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    const byY = new Map<number, { x: number; s: string }[]>();
    for (const it of tc.items as Array<{ str: string; transform: number[] }>) {
      const y = Math.round(it.transform[5]);
      const arr = byY.get(y) ?? [];
      arr.push({ x: it.transform[4], s: it.str });
      byY.set(y, arr);
    }
    for (const y of [...byY.keys()].sort((a, b) => b - a)) {
      const line = byY.get(y)!.sort((a, b) => a.x - b.x).map((o) => o.s).join(' ').replace(/\s+/g, ' ').trim();
      if (line) lines.push(line);
    }
  }

  let cur: RawTransaction | null = null;
  for (const line of lines) {
    const dm = line.match(DATE);
    const am = line.match(AMT);
    if (dm && am) {
      try {
        const occurredAt = `${dm[3]}-${dm[2]}-${dm[1]}`;
        const negative = am[1].trim().startsWith('-');
        const minor = parseMajorToMinor(am[1].replace('-', ''), 'RUB');
        if (minor === 0) continue;
        let desc = line.slice(dm[0].length, line.length - am[0].length).trim();
        desc = desc.replace(/^[A-ZА-Я0-9]{6,}\s*/i, ''); // убираем код операции
        cur = {
          occurredAt,
          amountOriginal: negative ? -minor : minor,
          currencyOriginal: defaultCurrency.toUpperCase() === 'RUR' ? 'RUB' : defaultCurrency.toUpperCase(),
          direction: negative ? 'expense' : 'income',
          description: desc,
          merchantRaw: desc,
        };
        rows.push(cur);
      } catch {
        cur = null;
      }
    } else if (cur && !DATE.test(line) && !FOOTER.test(line)) {
      // перенос описания
      cur.description = `${cur.description} ${line}`.trim();
      cur.merchantRaw = cur.description;
    }
  }

  if (rows.length === 0) errors.push({ line: 0, message: 'PDF: операции не распознаны. Возможно, это скан или нестандартный формат.' });
  return { rows, errors, detectedDelimiter: '' };
}

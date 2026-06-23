/**
 * Обработчик импорта выписок (§9.2). Асинхронный пайплайн:
 * Parse → Normalize → Categorize (beta) → Dedup → (Review) → Commit → Cleanup.
 *
 * I/O-шаги (S3-скачивание, запись в БД, удаление файла) помечены как точки
 * интеграции; доменная логика (парсинг, дедуп, категоризация) — проверенная,
 * из src/lib/import/*.
 */

import { parseCsv } from '@/lib/import/csv';
import { partitionDuplicates, type DedupInput } from '@/lib/import/dedup';
import { categorize } from '@/lib/import/categorize';
import type { ImportJob } from '../queues';

export interface ImportResult {
  rowsTotal: number;
  rowsImported: number;
  rowsDuplicated: number;
  errors: number;
}

export async function processImportJob(job: ImportJob): Promise<ImportResult> {
  // 1. Upload уже выполнен web-роутом: файл в S3, batch=pending.
  //    TODO(prod): загрузить batch и файл из S3 по importBatchId.
  //    Здесь демонстрируется поток на основе доменных функций.

  const file = await loadBatchFile(job.importBatchId);

  // 2. Parse + 3. Normalize (суммы → минорные, направление по знаку).
  const parsed = parseCsv(file.content, file.accountCurrency);

  // 4. Categorize (beta): не уверены — без категории.
  const categorized = parsed.rows.map((row) => ({
    ...row,
    category: categorize({ description: row.description, merchantRaw: row.merchantRaw }).categoryKey,
  }));

  // 5. Dedup по external_hash.
  const dedupInputs: Array<DedupInput & { _src: (typeof categorized)[number] }> = categorized.map((row) => ({
    accountId: file.accountId,
    occurredAt: row.occurredAt,
    amountOriginal: row.amountOriginal,
    currency: row.currencyOriginal,
    normalizedDescription: `${row.description} ${row.merchantRaw}`,
    _src: row,
  }));

  const existingHashes = await loadExistingHashes(job.userId, file.accountId);
  const { unique, duplicates } = partitionDuplicates(dedupInputs, existingHashes);

  // 6. (Review) — для PDF-беты статус needs_review; здесь опускаем.
  // 7. Commit — сохранить уникальные операции (source='import').
  await commitTransactions(job, unique);

  // 8. Cleanup — удалить сырой файл из S3 (§6).
  await deleteRawFile(job.importBatchId);

  return {
    rowsTotal: parsed.rows.length,
    rowsImported: unique.length,
    rowsDuplicated: duplicates.length,
    errors: parsed.errors.length,
  };
}

// --- Точки интеграции (заглушки для прод-реализации) -----------------------

async function loadBatchFile(_batchId: string): Promise<{ content: string; accountId: string; accountCurrency: string }> {
  // TODO(prod): получить import_batch из БД и скачать файл из S3.
  return { content: '', accountId: '', accountCurrency: 'RUB' };
}

async function loadExistingHashes(_userId: string, _accountId: string): Promise<Set<string>> {
  // TODO(prod): SELECT external_hash FROM transactions WHERE user_id=? AND account_id=?
  return new Set<string>();
}

async function commitTransactions(_job: ImportJob, _rows: unknown[]): Promise<void> {
  // TODO(prod): bulk INSERT в transactions (source='import', import_batch_id),
  // пересчёт amount_display по курсу на дату (§8), обновление счётчиков batch.
}

async function deleteRawFile(_batchId: string): Promise<void> {
  // TODO(prod): удалить объект из S3.
}

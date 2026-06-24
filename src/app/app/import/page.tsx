'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Item, PageHeader } from '@/components/cabinet/ui';
import { Select } from '@/components/ui/Select';
import { Money } from '@/components/cabinet/Money';
import { useLedger } from '@/lib/store/useLedger';
import { parseFile, ACCEPTED_EXTENSIONS, type ImportFormat } from '@/lib/import/parse';
import { categorize } from '@/lib/import/categorize';
import { dedupKey } from '@/lib/import/dedup-key';
import { CATEGORIES, getCategory } from '@/config/categories';
import { IconImport, IconPlus, IconTrash } from '@/components/icons';

type Stage = 'idle' | 'parsing' | 'review' | 'done';

interface ReviewRow {
  key: string;
  include: boolean;
  isDup: boolean;
  occurredAt: string;
  description: string;
  direction: 'income' | 'expense';
  amountMinor: number; // положительное
  categoryKey: string;
}

const FORMAT_LABEL: Record<ImportFormat, string> = {
  csv: 'CSV', xlsx: 'Excel (XLSX)', ofx: 'OFX/QFX', camt053: 'CAMT.053', mt940: 'MT940',
};

const CAT_OPTIONS = CATEGORIES.map((c) => ({ value: c.key, label: c.label }));

export default function ImportPage() {
  const { txs, currency, addTx } = useLedger();
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [format, setFormat] = useState<ImportFormat | null>(null);
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [errors, setErrors] = useState<number>(0);
  const [dupCount, setDupCount] = useState(0);
  const [imported, setImported] = useState(0);
  const [fatal, setFatal] = useState('');

  function pickCategory(direction: 'income' | 'expense', description: string, merchant: string): string {
    const guess = categorize({ description, merchantRaw: merchant }).categoryKey;
    if (guess && CATEGORIES.some((c) => c.key === guess)) return guess;
    return direction === 'income' ? 'salary' : 'other';
  }

  async function handleFile(file: File) {
    setFatal('');
    setStage('parsing');
    setFileName(file.name);
    try {
      const parsed = await parseFile(file, currency);
      setFormat(parsed.format);
      setErrors(parsed.errors.length);

      // Существующие операции — для дедупликации (без учёта счёта).
      const existing = new Set(
        txs.map((t) => dedupKey({ accountId: '', occurredAt: t.occurredAt, amountOriginal: t.direction === 'income' ? t.amountMinor : -t.amountMinor, currency, normalizedDescription: t.note || '' })),
      );

      const seen = new Set<string>();
      let dups = 0;
      const reviewRows: ReviewRow[] = parsed.rows.map((r, i) => {
        const signed = r.direction === 'income' ? Math.abs(r.amountOriginal) : -Math.abs(r.amountOriginal);
        const key = dedupKey({ accountId: '', occurredAt: r.occurredAt, amountOriginal: signed, currency, normalizedDescription: r.description });
        const isDup = existing.has(key) || seen.has(key);
        if (isDup) dups++;
        seen.add(key);
        return {
          key: `${key}#${i}`,
          include: !isDup,
          isDup,
          occurredAt: r.occurredAt,
          description: r.description || r.merchantRaw || 'Операция',
          direction: r.direction,
          amountMinor: Math.abs(r.amountOriginal),
          categoryKey: pickCategory(r.direction, r.description, r.merchantRaw),
        };
      });

      setDupCount(dups);
      setRows(reviewRows);
      setStage(reviewRows.length ? 'review' : 'idle');
      if (!reviewRows.length) setFatal('Не удалось распознать операции в файле. Проверьте формат.');
    } catch (e) {
      setStage('idle');
      setFatal(e instanceof Error ? e.message : 'Не удалось прочитать файл');
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = ''; // позволяем выбрать тот же файл повторно
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  function commit() {
    const toAdd = rows.filter((r) => r.include);
    for (const r of toAdd) {
      addTx({
        accountId: '',
        direction: r.direction,
        amountMinor: r.amountMinor,
        categoryKey: r.categoryKey,
        occurredAt: r.occurredAt,
        recurrence: 'one_time',
        note: r.description,
      });
    }
    setImported(toAdd.length);
    setStage('done');
  }

  function reset() {
    setStage('idle'); setRows([]); setFileName(''); setFormat(null); setErrors(0); setDupCount(0); setImported(0); setFatal('');
  }

  const includedCount = rows.filter((r) => r.include).length;

  return (
    <div>
      <PageHeader title="Импорт выписок" subtitle="CSV, Excel (XLSX), OFX/QFX, CAMT.053, MT940" />

      <input ref={inputRef} type="file" accept={ACCEPTED_EXTENSIONS} onChange={onInputChange} className="hidden" />

      {/* Зона загрузки */}
      {(stage === 'idle' || stage === 'parsing') && (
        <Item>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`card flex flex-col items-center gap-3 border-2 border-dashed py-14 text-center transition-colors ${dragOver ? 'border-accent bg-accent/10' : 'border-accent/30 bg-accent/5'}`}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-grad-brand text-white shadow-glow"><IconImport size={26} /></div>
            {stage === 'parsing' ? (
              <p className="text-sm text-muted">Читаем файл «{fileName}»…</p>
            ) : (
              <>
                <p className="font-display text-lg font-bold">Перетащите файл сюда</p>
                <p className="text-sm text-muted">или выберите на устройстве — категории определятся автоматически</p>
                <button onClick={() => inputRef.current?.click()} className="btn btn-primary mt-1">Выбрать файл</button>
                <p className="text-xs text-muted">Файл обрабатывается в браузере и никуда не загружается.</p>
              </>
            )}
          </div>
          {fatal && <p className="mt-3 text-center text-sm text-negative">{fatal}</p>}
        </Item>
      )}

      {/* Предпросмотр */}
      {stage === 'review' && (
        <Item>
          <div className="card">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-display text-lg font-bold">Проверьте операции</div>
                <div className="text-sm text-muted">{fileName} · формат {format ? FORMAT_LABEL[format] : '—'}</div>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="rounded-full bg-positive/15 px-3 py-1 font-medium text-positive">Распознано: {rows.length}</span>
                <span className="rounded-full bg-bg-2 px-3 py-1 font-medium text-muted">Дубликаты: {dupCount}</span>
                {errors > 0 && <span className="rounded-full bg-negative/10 px-3 py-1 font-medium text-negative">Ошибки: {errors}</span>}
              </div>
            </div>

            <div className="-mx-2 max-h-[55vh] overflow-auto px-2">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-surface text-left text-muted">
                  <tr>
                    <th className="px-2 py-2 font-medium"></th>
                    <th className="px-2 py-2 font-medium">Дата</th>
                    <th className="px-2 py-2 font-medium">Описание</th>
                    <th className="px-2 py-2 font-medium">Категория</th>
                    <th className="px-2 py-2 text-right font-medium">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr key={r.key} className={`border-t border-ink/8 ${r.include ? '' : 'opacity-45'}`}>
                      <td className="px-2 py-2">
                        <input type="checkbox" checked={r.include} onChange={(e) => setRows((rs) => rs.map((x, i) => (i === idx ? { ...x, include: e.target.checked } : x)))} className="h-4 w-4 accent-[var(--accent)]" aria-label="Включить" />
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 tnum text-muted">{r.occurredAt}{r.isDup && <span className="ml-1 text-[10px] text-muted">дубль</span>}</td>
                      <td className="max-w-[140px] truncate px-2 py-2" title={r.description}>{r.description}</td>
                      <td className="px-2 py-2">
                        <Select value={r.categoryKey} onChange={(v) => setRows((rs) => rs.map((x, i) => (i === idx ? { ...x, categoryKey: v } : x)))} options={CAT_OPTIONS} ariaLabel="Категория" className="min-w-[130px]" />
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 text-right">
                        <Money amount={r.direction === 'income' ? r.amountMinor : -r.amountMinor} currency={currency} colorize showSign />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <button onClick={reset} className="btn btn-ghost">Отмена</button>
              <button onClick={commit} disabled={includedCount === 0} className="btn btn-primary disabled:opacity-40">
                <IconPlus size={18} /> Импортировать {includedCount}
              </button>
            </div>
          </div>
        </Item>
      )}

      {/* Готово */}
      <AnimatePresence>
        {stage === 'done' && (
          <Item>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-positive/15 text-positive">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
              </div>
              <h3 className="font-display text-xl font-bold">Импортировано {imported} операций</h3>
              <p className="text-sm text-muted">{dupCount > 0 && `Пропущено дубликатов: ${dupCount}. `}Данные добавлены в ваш аккаунт.</p>
              <div className="mt-1 flex gap-2">
                <button onClick={reset} className="btn btn-secondary">Импортировать ещё</button>
              </div>
            </motion.div>
          </Item>
        )}
      </AnimatePresence>

      {/* Подсказка по форматам */}
      {stage === 'idle' && (
        <Item className="mt-4">
          <div className="card text-sm text-muted">
            <div className="mb-2 font-display text-base font-semibold text-ink">Поддерживаемые форматы</div>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              <li>• <b className="text-ink">CSV</b> — авто-определение разделителя и колонок (дата, сумма, описание)</li>
              <li>• <b className="text-ink">Excel</b> — .xlsx / .xls (первый лист)</li>
              <li>• <b className="text-ink">OFX / QFX</b> — выгрузка из интернет-банка</li>
              <li>• <b className="text-ink">CAMT.053</b> — ISO 20022 (XML)</li>
              <li>• <b className="text-ink">MT940</b> — SWIFT-выписка</li>
            </ul>
            <p className="mt-3 text-xs">Категории определяются по словарю (бета) — проверьте перед импортом. Дубликаты выявляются автоматически.</p>
          </div>
        </Item>
      )}
    </div>
  );
}

'use client';

import { Item, PageHeader } from '@/components/cabinet/ui';
import { demoAccounts } from '@/lib/demo';

/** Импорт выписок (§9, §15.2): загрузка, статус, отчёт, бета-PDF. */
export default function ImportPage() {
  return (
    <div>
      <PageHeader title="Импорт выписок" subtitle="CSV, XLSX, OFX/QFX, MT940, CAMT.053. PDF — в бете." />

      <Item>
        <div className="card space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm text-muted">Счёт зачисления</span>
              <select className="mt-1.5 w-full rounded-full border border-ink/10 bg-bg-2 px-4 py-2.5 text-sm outline-none">
                {demoAccounts.map((a) => <option key={a.id} className="bg-bg-2">{a.name} ({a.currency})</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-muted">Формат</span>
              <select className="mt-1.5 w-full rounded-full border border-ink/10 bg-bg-2 px-4 py-2.5 text-sm outline-none">
                {['Определить автоматически', 'CSV', 'XLSX', 'OFX / QFX', 'MT940', 'CAMT.053', 'PDF (бета)'].map((o) => <option key={o} className="bg-bg-2">{o}</option>)}
              </select>
            </label>
          </div>

          <div className="rounded-bento border-2 border-dashed border-violet/30 bg-violet/5 p-10 text-center transition-colors hover:border-violet/50 hover:bg-violet/10">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-grad-brand text-white shadow-glow">⬆</div>
            <p className="text-sm text-muted">Перетащите файл выписки сюда или</p>
            <button className="btn btn-primary mt-3">Выбрать файл</button>
            <p className="mt-3 text-xs text-muted">Файл удаляется с сервера после обработки (§6).</p>
          </div>

          <div className="flex items-start gap-3 rounded-bento border border-magenta/20 bg-magenta/10 p-4 text-sm">
            <span aria-hidden>⚠</span>
            <p>
              Импорт PDF и автокатегоризация работают в <strong>бета-режиме</strong> — возможны неточности.
              Проверьте импортированные операции перед сохранением.
            </p>
          </div>
        </div>
      </Item>

      <Item className="mt-4">
        <div className="card">
          <h2 className="mb-4 font-display text-lg font-semibold">Последний импорт</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <Stat label="Импортировано" value="128" className="text-positive" />
            <Stat label="Дубликаты" value="14" className="text-muted" />
            <Stat label="Ошибки" value="2" className="text-negative" />
          </div>
        </div>
      </Item>
    </div>
  );
}

function Stat({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-bento border border-ink/8 bg-bg-2 p-4">
      <div className={`metric-value text-2xl ${className}`}>{value}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}

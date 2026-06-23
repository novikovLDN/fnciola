'use client';

import { useState } from 'react';
import { Item, PageHeader } from '@/components/cabinet/ui';
import { Select } from '@/components/ui/Select';
import { useLedger } from '@/lib/store/useLedger';
import { IconImport } from '@/components/icons';

const FORMATS = ['Определить автоматически', 'CSV', 'XLSX', 'OFX / QFX', 'MT940', 'CAMT.053', 'PDF (бета)'];

/** Импорт выписок (§9): загрузка, статус, отчёт, бета-PDF. */
export default function ImportPage() {
  const { accounts } = useLedger();
  const accOptions = accounts.length
    ? accounts.map((a) => ({ value: a.id, label: `${a.name}`, hint: a.currency }))
    : [{ value: 'auto', label: 'Создастся автоматически' }];
  const [account, setAccount] = useState(accOptions[0].value);
  const [format, setFormat] = useState('Определить автоматически');

  return (
    <div>
      <PageHeader title="Импорт выписок" subtitle="CSV, XLSX, OFX/QFX, MT940, CAMT.053. PDF — в бете." />

      <Item>
        <div className="card space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="text-sm text-muted">Счёт зачисления</span>
              <Select className="mt-1.5" value={account} onChange={setAccount} options={accOptions} ariaLabel="Счёт зачисления" />
            </div>
            <div>
              <span className="text-sm text-muted">Формат</span>
              <Select className="mt-1.5" value={format} onChange={setFormat} options={FORMATS.map((f) => ({ value: f, label: f }))} ariaLabel="Формат файла" />
            </div>
          </div>

          <div className="rounded-3xl border-2 border-dashed border-accent/30 bg-accent/5 p-10 text-center transition-colors hover:border-accent/50 hover:bg-accent/10">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-grad-brand text-white shadow-glow"><IconImport size={22} /></div>
            <p className="text-sm text-muted">Перетащите файл выписки сюда или</p>
            <button className="btn btn-primary mt-3">Выбрать файл</button>
            <p className="mt-3 text-xs text-muted">Файл удаляется с сервера после обработки (§6).</p>
          </div>

          <div className="flex items-start gap-3 rounded-3xl border border-accent/20 bg-accent/5 p-4 text-sm">
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
            <Stat label="Импортировано" value="—" />
            <Stat label="Дубликаты" value="—" />
            <Stat label="Ошибки" value="—" />
          </div>
          <p className="mt-4 text-center text-xs text-muted">Импорт станет доступен после подключения хранилища выписок.</p>
        </div>
      </Item>
    </div>
  );
}

function Stat({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-3xl border border-ink/8 bg-bg-2 p-4">
      <div className={`metric-value text-2xl ${className}`}>{value}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}

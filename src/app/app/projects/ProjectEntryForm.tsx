'use client';

import { useState } from 'react';
import { useLedger } from '@/lib/store/useLedger';
import { parseMajorToMinor, groupAmountInput } from '@/lib/money';
import type { EntryKind, ExpenseGroup, Recurrence } from '@/lib/metrics';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { IconPlus, IconArrowUp, IconArrowDown } from '@/components/icons';

const GROUPS: { value: ExpenseGroup; label: string }[] = [
  { value: 'cogs', label: 'Себестоимость (COGS)' },
  { value: 'opex', label: 'Операционные (OPEX)' },
  { value: 'taxes', label: 'Налоги' },
  { value: 'interest', label: 'Проценты' },
  { value: 'depreciation', label: 'Амортизация' },
];

const RECUR: { value: Recurrence; label: string }[] = [
  { value: 'one_time', label: 'Разово' },
  { value: 'monthly', label: 'Ежемесячно' },
  { value: 'quarterly', label: 'Ежеквартально' },
  { value: 'yearly', label: 'Ежегодно' },
  { value: 'weekly', label: 'Еженедельно' },
  { value: 'daily', label: 'Ежедневно' },
];

/** Форма добавления записи проекта (доход/расход, группа, повторяемость, период). */
export function ProjectEntryForm({ projectId, currency }: { projectId: string; currency: string }) {
  const { addEntry } = useLedger();
  const [kind, setKind] = useState<EntryKind>('income');
  const [group, setGroup] = useState<ExpenseGroup>('cogs');
  const [recurrence, setRecurrence] = useState<Recurrence>('monthly');
  const [raw, setRaw] = useState('');
  const [start, setStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');

  let amount = 0;
  try { amount = raw.trim() ? parseMajorToMinor(raw, currency) : 0; } catch { amount = 0; }
  const valid = amount > 0;

  function submit() {
    if (!valid) return;
    addEntry({
      projectId,
      kind,
      expenseGroup: kind === 'expense' ? group : null,
      amount,
      recurrence,
      startDate: start,
      endDate: null,
      note: note.trim() || undefined,
    });
    setRaw('');
    setNote('');
  }

  return (
    <div className="card space-y-4">
      <h2 className="font-display text-base font-semibold">Добавить запись</h2>

      <div className="grid grid-cols-2 gap-2 rounded-full bg-bg-2 p-1 text-sm font-semibold">
        <button onClick={() => setKind('income')} className={`flex items-center justify-center gap-1.5 rounded-full py-2 transition-colors ${kind === 'income' ? 'bg-positive text-white' : 'text-muted'}`}>
          <IconArrowDown size={16} /> Доход
        </button>
        <button onClick={() => setKind('expense')} className={`flex items-center justify-center gap-1.5 rounded-full py-2 transition-colors ${kind === 'expense' ? 'bg-accent text-white' : 'text-muted'}`}>
          <IconArrowUp size={16} /> Расход
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs text-muted">Сумма, {currency}</span>
          <input
            inputMode="decimal"
            value={groupAmountInput(raw)}
            onChange={(e) => setRaw(e.target.value.replace(/\s/g, '').replace(/[^\d.,]/g, ''))}
            placeholder="0"
            className="mt-1 w-full rounded-2xl border border-ink/10 bg-bg-2 px-4 py-2.5 text-sm tnum outline-none focus:border-accent"
          />
        </label>
        <div className="block">
          <span className="text-xs text-muted">Повторяемость</span>
          <Select className="mt-1" value={recurrence} onChange={(v) => setRecurrence(v as Recurrence)} options={RECUR} ariaLabel="Повторяемость" />
        </div>
      </div>

      {kind === 'expense' && (
        <div className="block">
          <span className="text-xs text-muted">Группа расходов</span>
          <Select className="mt-1" value={group} onChange={(v) => setGroup(v as ExpenseGroup)} options={GROUPS} ariaLabel="Группа расходов" />
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="block">
          <span className="text-xs text-muted">Дата начала</span>
          <DatePicker className="mt-1" value={start} onChange={setStart} ariaLabel="Дата начала" />
        </div>
        <label className="block">
          <span className="text-xs text-muted">Заметка</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="напр. Аренда" className="mt-1 w-full rounded-2xl border border-ink/10 bg-bg-2 px-4 py-2.5 text-sm outline-none focus:border-accent" />
        </label>
      </div>

      <button onClick={submit} disabled={!valid} className="btn btn-primary w-full disabled:opacity-40">
        <IconPlus size={18} /> Добавить {kind === 'income' ? 'доход' : 'расход'}
      </button>
    </div>
  );
}

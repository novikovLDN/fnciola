'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLedger, type Direction } from '@/lib/store/useLedger';
import { parseMajorToMinor, formatMoney, groupAmountInput } from '@/lib/money';
import { categoriesFor, getCategory } from '@/config/categories';
import { IconPlus, IconArrowDown, IconArrowUp } from '@/components/icons';
import { DatePicker } from '@/components/ui/DatePicker';

/**
 * Крупная панель быстрого добавления операции (простой режим):
 * большое поле суммы, переключатель доход/расход, выбор категории, дата.
 * Всё считается на целых минорных единицах.
 */
export function AddPanel({ onAdded }: { onAdded?: () => void }) {
  const { addTx, currency } = useLedger();
  const [direction, setDirection] = useState<Direction>('expense');
  const [raw, setRaw] = useState('');
  const cats = categoriesFor(direction);
  const [catKey, setCatKey] = useState(cats[0]?.key ?? 'other');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [flash, setFlash] = useState(false);

  function switchDirection(d: Direction) {
    setDirection(d);
    const next = categoriesFor(d);
    if (!next.some((c) => c.key === catKey)) setCatKey(next[0]?.key ?? 'other');
  }

  let amountMinor = 0;
  try {
    amountMinor = raw.trim() ? parseMajorToMinor(raw, currency) : 0;
  } catch {
    amountMinor = 0;
  }
  const valid = amountMinor > 0;

  function submit() {
    if (!valid) return;
    addTx({ accountId: '', direction, amountMinor, categoryKey: catKey, occurredAt: date, note: note.trim() || undefined });
    setRaw('');
    setNote('');
    setFlash(true);
    setTimeout(() => setFlash(false), 700);
    onAdded?.();
  }

  const accent = direction === 'income' ? 'var(--positive)' : 'var(--accent)';

  return (
    <div className="card relative">
      {/* Переключатель доход/расход */}
      <div className="relative mb-5 grid grid-cols-2 overflow-hidden rounded-full bg-bg-2 p-1 text-sm font-semibold">
        <motion.div
          layout
          className="absolute inset-y-1 w-1/2 rounded-full"
          style={{ left: direction === 'expense' ? 4 : '50%', background: `rgb(${direction === 'expense' ? 'var(--accent)' : 'var(--positive)'})` }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        />
        <button onClick={() => switchDirection('expense')} className={`relative z-10 flex items-center justify-center gap-1.5 rounded-full py-2 transition-colors ${direction === 'expense' ? 'text-white' : 'text-muted'}`}>
          <IconArrowUp size={16} /> Расход
        </button>
        <button onClick={() => switchDirection('income')} className={`relative z-10 flex items-center justify-center gap-1.5 rounded-full py-2 transition-colors ${direction === 'income' ? 'text-white' : 'text-muted'}`}>
          <IconArrowDown size={16} /> Доход
        </button>
      </div>

      {/* Большое поле суммы */}
      <div className="relative flex flex-col items-center py-4">
        <span className="label mb-2">Сумма</span>
        <div className="flex w-full max-w-[300px] items-baseline justify-center gap-2">
          <input
            inputMode="decimal"
            value={groupAmountInput(raw)}
            onChange={(e) => setRaw(e.target.value.replace(/\s/g, '').replace(/[^\d.,]/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="0"
            aria-label="Сумма"
            size={1}
            className="min-w-0 max-w-full flex-1 bg-transparent text-center font-display text-4xl font-extrabold tnum tracking-tight outline-none placeholder:text-ink/20 sm:text-5xl"
            style={{ color: valid ? `rgb(${accent})` : undefined }}
          />
          <span className="font-display text-2xl font-bold text-muted">₽</span>
        </div>
        <AnimatePresence>
          {flash && (
            <motion.span
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute -bottom-1 text-xs font-medium"
              style={{ color: `rgb(var(--positive))` }}
            >
              Добавлено ✓
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Категории */}
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {cats.map((c) => {
          const Icon = c.icon;
          const active = c.key === catKey;
          return (
            <button
              key={c.key}
              onClick={() => setCatKey(c.key)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${active ? 'border-transparent text-white' : 'border-ink/10 text-muted hover:border-ink/20'}`}
              style={active ? { background: c.color } : undefined}
            >
              <Icon width={14} height={14} />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Дата + заметка */}
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <DatePicker value={date} onChange={setDate} ariaLabel="Дата операции" />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Заметка (необязательно)" aria-label="Заметка" className="rounded-2xl border border-ink/10 bg-bg-2 px-4 py-2.5 text-sm outline-none placeholder:text-muted" />
      </div>

      <button
        onClick={submit}
        disabled={!valid}
        className="btn btn-primary mt-5 w-full py-3 text-base disabled:cursor-not-allowed disabled:opacity-40"
      >
        <IconPlus size={18} />
        Добавить {direction === 'income' ? 'доход' : 'расход'}{valid ? ` · ${formatMoney(amountMinor, currency)}` : ''}
      </button>
      <p className="mt-2 text-center text-xs text-muted">Категория: {getCategory(catKey).label}</p>
    </div>
  );
}

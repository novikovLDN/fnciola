'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Popover } from './Popover';

/**
 * Кастомный календарь в стиле iOS «Liquid Glass». Поповер рендерится в портале,
 * поэтому никогда не обрезается родителями. Значение — строка YYYY-MM-DD.
 */

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

function toKey(d: Date) { return d.toISOString().slice(0, 10); }
function parse(s: string) { const d = new Date(`${s}T00:00:00Z`); return Number.isNaN(d.getTime()) ? new Date() : d; }
function fmt(s: string) {
  const d = parse(s);
  return `${String(d.getUTCDate()).padStart(2, '0')}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${d.getUTCFullYear()}`;
}

export function DatePicker({ value, onChange, ariaLabel = 'Дата', className = '' }: { value: string; onChange: (v: string) => void; ariaLabel?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => parse(value));
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { if (open) setView(parse(value)); }, [open, value]);

  const grid = useMemo(() => {
    const year = view.getUTCFullYear();
    const month = view.getUTCMonth();
    const first = new Date(Date.UTC(year, month, 1));
    const startWeekday = (first.getUTCDay() + 6) % 7;
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(Date.UTC(year, month, d)));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [view]);

  const todayKey = toKey(new Date());
  const move = (delta: number) => setView((v) => new Date(Date.UTC(v.getUTCFullYear(), v.getUTCMonth() + delta, 1)));

  return (
    <div className={className}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={ariaLabel}
        className="flex w-full items-center justify-between gap-2 rounded-2xl border border-ink/10 bg-bg-2 px-4 py-2.5 text-left text-sm outline-none transition-colors hover:border-ink/20 focus-visible:border-accent"
      >
        <span className="tnum">{fmt(value)}</span>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="text-muted">
          <rect x="3" y="4.5" width="18" height="16" rx="3" /><path d="M3 9h18M8 2.5v4M16 2.5v4" />
        </svg>
      </button>

      <Popover open={open} anchorEl={btnRef.current} onClose={() => setOpen(false)} width={304}>
        <div className="glass rounded-3xl p-4 shadow-[0_24px_60px_-24px_rgba(17,17,19,0.45)]">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" onClick={() => move(-1)} aria-label="Предыдущий месяц" className="flex h-8 w-8 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/[0.06]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <div className="font-display text-sm font-bold">{MONTHS[view.getUTCMonth()]} {view.getUTCFullYear()}</div>
            <button type="button" onClick={() => move(1)} aria-label="Следующий месяц" className="flex h-8 w-8 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/[0.06]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-medium text-muted">
            {WEEKDAYS.map((w) => <div key={w} className="py-1">{w}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {grid.map((d, i) => {
              if (!d) return <div key={i} />;
              const key = toKey(d);
              const isSel = key === value;
              const isToday = key === todayKey;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => { onChange(key); setOpen(false); }}
                  className={`relative flex h-9 items-center justify-center rounded-full text-sm tnum transition-colors ${isSel ? 'bg-grad-brand font-bold text-white shadow-glow' : 'text-ink hover:bg-ink/[0.06]'}`}
                >
                  {d.getUTCDate()}
                  {isToday && !isSel && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-accent" />}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex justify-between border-t border-ink/8 pt-3">
            <button type="button" onClick={() => { onChange(todayKey); setOpen(false); }} className="text-xs font-semibold text-accent">Сегодня</button>
            <button type="button" onClick={() => setOpen(false)} className="text-xs font-medium text-muted">Закрыть</button>
          </div>
        </div>
      </Popover>
    </div>
  );
}

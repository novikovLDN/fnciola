'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Popover } from './Popover';

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

/**
 * Кастомный технологичный выпадающий список. Поповер — в портале, не обрезается
 * родителями. Доступность: стрелки/Enter/Esc, закрытие по клику вне.
 */
export function Select({
  value,
  onChange,
  options,
  placeholder = 'Выберите…',
  ariaLabel,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const btnRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (open) setActive(Math.max(0, options.findIndex((o) => o.value === value)));
  }, [open, value, options]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') return setOpen(false);
    if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
      e.preventDefault();
      return setOpen(true);
    }
    if (open) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(options.length - 1, a + 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
      else if (e.key === 'Enter') { e.preventDefault(); const o = options[active]; if (o) { onChange(o.value); setOpen(false); } }
    }
  }

  return (
    <div className={className}>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        className="flex w-full items-center justify-between gap-2 rounded-2xl border border-ink/10 bg-bg-2 px-4 py-2.5 text-left text-sm outline-none transition-colors hover:border-ink/20 focus-visible:border-accent"
      >
        <span className={`truncate ${selected ? 'text-ink' : 'text-muted'}`}>{selected ? selected.label : placeholder}</span>
        <motion.svg animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted">
          <path d="m6 9 6 6 6-6" />
        </motion.svg>
      </button>

      <Popover open={open} anchorEl={btnRef.current} onClose={() => setOpen(false)} matchAnchorWidth>
        <ul role="listbox" className="glass max-h-64 overflow-auto rounded-2xl p-1.5 shadow-[0_20px_50px_-20px_rgba(17,17,19,0.4)]">
          {options.map((o, i) => {
            const isSel = o.value === value;
            const isActive = i === active;
            return (
              <li key={o.value} role="option" aria-selected={isSel}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${isActive ? 'bg-ink/[0.05]' : ''} ${isSel ? 'font-semibold text-accent' : 'text-ink'}`}
                >
                  <span className="truncate">{o.label}{o.hint && <span className="ml-1 text-muted">{o.hint}</span>}</span>
                  {isSel && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <path d="m5 12 5 5L20 7" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </Popover>
    </div>
  );
}

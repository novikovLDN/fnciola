'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useLedger } from '@/lib/store/useLedger';
import { getCategory } from '@/config/categories';
import { Money } from '@/components/cabinet/Money';
import { IconTrash } from '@/components/icons';

const RECUR_SHORT: Record<string, string> = { daily: 'ежедн.', weekly: 'еженед.', monthly: 'ежемес.', quarterly: 'ежекварт.', yearly: 'ежегодно' };

/** Список операций из леджера (с развёрнутыми регулярными платежами). Удаление — по правилу. */
export function OpsList({ limit, showDelete = true }: { limit?: number; showDelete?: boolean }) {
  const { materialized, deleteTx, currency } = useLedger();
  const items = [...materialized].sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : a.occurredAt > b.occurredAt ? -1 : 0));
  const shown = limit ? items.slice(0, limit) : items;

  if (shown.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">Пока нет операций. Добавьте первую сверху.</p>;
  }

  return (
    <ul className="divide-y divide-ink/8">
      <AnimatePresence initial={false}>
        {shown.map((t) => {
          const cat = getCategory(t.categoryKey);
          const Icon = cat.icon;
          const isRecurring = t.recurrence !== 'one_time';
          return (
            <motion.li
              key={t.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: cat.color }}>
                  <Icon width={18} height={18} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-medium">{t.note || cat.label}</span>
                    {isRecurring && (
                      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent" title="Регулярный платёж">
                        ↻ {RECUR_SHORT[t.recurrence]}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted">{cat.label} · {t.occurredAt}</div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Money amount={t.direction === 'income' ? t.amountMinor : -t.amountMinor} currency={currency} colorize showSign />
                {showDelete && (
                  <button
                    onClick={() => deleteTx(t.ruleId)}
                    aria-label={isRecurring ? 'Удалить регулярный платёж' : 'Удалить операцию'}
                    title={isRecurring ? 'Удалит все повторы этого платежа' : 'Удалить'}
                    className="rounded-full p-1.5 text-muted transition-colors hover:bg-negative/10 hover:text-negative"
                  >
                    <IconTrash size={16} />
                  </button>
                )}
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}

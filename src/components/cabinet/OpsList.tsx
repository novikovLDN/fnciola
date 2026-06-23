'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useLedger } from '@/lib/store/useLedger';
import { getCategory } from '@/config/categories';
import { Money } from '@/components/cabinet/Money';
import { IconTrash } from '@/components/icons';

/** Список операций из леджера с удалением. */
export function OpsList({ limit, showDelete = true }: { limit?: number; showDelete?: boolean }) {
  const { txs, deleteTx, currency } = useLedger();
  const items = [...txs].sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : a.occurredAt > b.occurredAt ? -1 : b.createdAt - a.createdAt));
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
                  <div className="truncate font-medium">{t.note || cat.label}</div>
                  <div className="text-xs text-muted">{cat.label} · {t.occurredAt}</div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Money amount={t.direction === 'income' ? t.amountMinor : -t.amountMinor} currency={currency} colorize showSign />
                {showDelete && (
                  <button onClick={() => deleteTx(t.id)} aria-label="Удалить операцию" className="rounded-full p-1.5 text-muted transition-colors hover:bg-negative/10 hover:text-negative">
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

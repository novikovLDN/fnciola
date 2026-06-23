'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLedger } from '@/lib/store/useLedger';
import { Money } from '@/components/cabinet/Money';
import { AddPanel } from '@/components/cabinet/AddPanel';
import { OpsList } from '@/components/cabinet/OpsList';
import { LedgerCharts } from '@/components/cabinet/LedgerCharts';
import { IconHome, IconList, IconPie, IconArrowDown, IconArrowUp, IconSpark } from '@/components/icons';

type Tab = 'home' | 'ops' | 'stats';

/** Дашборд — простой режим: три вкладки, крупное добавление операций. */
export default function DashboardPage() {
  const { hydrated, balance, totalIncome, totalExpense, txs, currency, seedSample } = useLedger();
  const [tab, setTab] = useState<Tab>('home');

  const tabs: { id: Tab; label: string; icon: typeof IconHome }[] = [
    { id: 'home', label: 'Главная', icon: IconHome },
    { id: 'ops', label: 'Операции', icon: IconList },
    { id: 'stats', label: 'Аналитика', icon: IconPie },
  ];

  return (
    <div>
      {/* Баланс */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-5 text-center">
        <div className="label">Баланс</div>
        <div className="mt-1 font-display text-4xl font-extrabold tracking-tight tnum sm:text-5xl">
          {hydrated ? <Money amount={balance} currency={currency} colorize={balance < 0} /> : <span className="opacity-30">…</span>}
        </div>
        <div className="mt-3 inline-flex items-center gap-4 rounded-full bg-bg-2 px-4 py-2 text-sm">
          <span className="flex items-center gap-1.5 text-positive"><IconArrowDown size={15} /> <Money amount={totalIncome} currency={currency} /></span>
          <span className="h-4 w-px bg-ink/10" />
          <span className="flex items-center gap-1.5 text-negative"><IconArrowUp size={15} /> <Money amount={totalExpense} currency={currency} /></span>
        </div>
      </motion.div>

      {/* Табы */}
      <div className="mx-auto mb-5 grid max-w-md grid-cols-3 rounded-full border border-ink/8 bg-surface p-1 text-sm font-semibold shadow-sm">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className="relative flex items-center justify-center gap-1.5 rounded-full py-2 transition-colors" aria-current={active ? 'page' : undefined}>
              {active && <motion.span layoutId="tab-pill" className="absolute inset-0 -z-0 rounded-full bg-grad-brand" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <span className={`relative z-10 flex items-center gap-1.5 ${active ? 'text-white' : 'text-muted'}`}>
                <Icon size={16} /> {t.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Контент вкладки */}
      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
        {tab === 'home' && (
          <div className="mx-auto max-w-xl space-y-4">
            <AddPanel onAdded={() => setTab('home')} />
            {txs.length > 0 ? (
              <div className="card">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="font-display text-base font-semibold">Последние операции</h2>
                  <button onClick={() => setTab('ops')} className="text-xs font-medium text-accent">Все →</button>
                </div>
                <OpsList limit={4} showDelete={false} />
              </div>
            ) : (
              <EmptyState onSeed={seedSample} />
            )}
          </div>
        )}

        {tab === 'ops' && (
          <div className="mx-auto max-w-xl">
            <div className="card"><OpsList /></div>
          </div>
        )}

        {tab === 'stats' && <LedgerCharts />}
      </motion.div>
    </div>
  );
}

function EmptyState({ onSeed }: { onSeed: () => void }) {
  return (
    <div className="card flex flex-col items-center gap-3 py-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-grad-brand text-white"><IconSpark size={26} /></span>
      <h3 className="font-display text-lg font-bold">Начните вести учёт</h3>
      <p className="max-w-xs text-sm text-muted">Добавьте первый доход или расход выше — баланс, графики и аналитика посчитаются автоматически.</p>
      <button onClick={onSeed} className="btn btn-secondary mt-1">Заполнить примером</button>
    </div>
  );
}

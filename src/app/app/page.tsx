'use client';

import { Stagger, Item, PageHeader } from '@/components/cabinet/ui';
import { TiltCard } from '@/components/visual/TiltCard';
import { MoneyCount } from '@/components/cabinet/MoneyCount';
import { Money } from '@/components/cabinet/Money';
import { DashboardCharts } from './DashboardCharts';
import { demoAccounts, demoTransactions, DISPLAY_CURRENCY } from '@/lib/demo';
import { sum } from '@/lib/money';
import { dict } from '@/i18n/ru';

/** Dashboard — ключевые числа, графики, последние операции, инсайты (§15.2). */
export default function DashboardPage() {
  const totalBalance = sum(demoAccounts.map((a) => a.balanceMinor));
  const income = sum(demoTransactions.filter((t) => t.direction === 'income').map((t) => t.amountDisplayMinor));
  const expense = sum(demoTransactions.filter((t) => t.direction === 'expense').map((t) => t.amountDisplayMinor));
  const net = income + expense;

  const cards = [
    { label: dict.common.balance, amount: totalBalance, colorize: false, accent: true },
    { label: dict.common.income, amount: income, colorize: true },
    { label: dict.common.expense, amount: expense, colorize: true },
  ];

  return (
    <div>
      <PageHeader
        title={dict.nav.dashboard}
        subtitle={`Июнь 2026 · сведено в ${DISPLAY_CURRENCY}`}
        action={<span className="badge">Текущий месяц</span>}
      />

      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Item key={c.label}>
            <TiltCard>
              <div className={`card card-hover ${c.accent ? 'ring-gradient' : ''}`}>
                <div className="label">{c.label}</div>
                <div className="metric-value mt-2">
                  <MoneyCount amount={c.amount} currency={DISPLAY_CURRENCY} colorize={c.colorize} />
                </div>
              </div>
            </TiltCard>
          </Item>
        ))}
      </Stagger>

      {/* Инсайт */}
      <Item className="mt-4">
        <div className="card flex items-center gap-4 border-violet/20">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-grad-brand text-white">✦</span>
          <p className="text-sm">
            Чистый результат за месяц — <MoneyCount amount={net} currency={DISPLAY_CURRENCY} colorize showSign className="font-semibold" />.{' '}
            <span className="text-muted">
              {net >= 0 ? 'Вы откладываете больше, чем тратите.' : 'Расходы превысили доходы — присмотритесь к крупным тратам.'}
            </span>
          </p>
        </div>
      </Item>

      <div className="mt-4">
        <DashboardCharts />
      </div>

      {/* Последние операции */}
      <Item className="mt-4">
        <div className="card">
          <h2 className="mb-4 font-display text-lg font-semibold">Последние операции</h2>
          <ul className="divide-y divide-white/5">
            {demoTransactions.slice().reverse().map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm ${t.direction === 'income' ? 'bg-positive/15 text-positive' : 'bg-white/5 text-muted'}`}>
                    {t.direction === 'income' ? '↓' : '↑'}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate font-medium">{t.description}</div>
                    <div className="text-xs text-muted">{t.category} · {t.occurredAt}</div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <Money amount={t.amountDisplayMinor} currency={DISPLAY_CURRENCY} colorize showSign />
                  {t.currencyOriginal !== DISPLAY_CURRENCY && (
                    <div className="text-xs text-muted">
                      ориг.: <Money amount={t.amountOriginalMinor} currency={t.currencyOriginal} />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Item>
    </div>
  );
}

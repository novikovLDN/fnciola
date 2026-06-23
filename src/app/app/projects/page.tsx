'use client';

import { Stagger, Item, PageHeader } from '@/components/cabinet/ui';
import { TiltCard } from '@/components/visual/TiltCard';
import { Money } from '@/components/cabinet/Money';
import { MoneyCount } from '@/components/cabinet/MoneyCount';
import { ExpenseStructureChart } from './ExpenseStructureChart';
import { computeMetrics } from '@/lib/metrics';
import { demoProject, demoProjectEntries, demoCashBalance } from '@/lib/demo';
import { dict } from '@/i18n/ru';

/** Бизнес-модуль «Мой проект» (§10): дашборд метрик за период. */
export default function ProjectsPage() {
  const period = { from: '2026-01-01', to: '2026-06-30' };
  const m = computeMetrics(demoProjectEntries, period, { cashBalance: demoCashBalance });
  const c = demoProject.currency;
  const fmtPct = (v: number | null) => (v == null ? dict.common.noData : `${v.toFixed(1)}%`);

  return (
    <div>
      <PageHeader
        title={demoProject.name}
        subtitle="01.01.2026 — 30.06.2026 · валюта проекта RUB"
        action={<span className="badge">6 месяцев</span>}
      />

      <Item>
        <div className="card mb-4 flex items-center gap-3 border-violet/15 py-3 text-sm text-muted">
          <span aria-hidden>ℹ</span>
          {dict.common.disclaimer}
        </div>
      </Item>

      <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label={dict.metrics.revenue} amount={m.revenue} currency={c} />
        <MetricCard label={dict.metrics.grossProfit} amount={m.grossProfit} currency={c} colorize sub={`Маржа ${fmtPct(m.grossMarginPct)}`} />
        <MetricCard label={dict.metrics.ebitda} amount={m.ebitda} currency={c} colorize highlight />
        <MetricCard label={dict.metrics.netProfit} amount={m.netProfit} currency={c} colorize sub={`Маржа ${fmtPct(m.netMarginPct)}`} />
      </Stagger>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Item>
          <div className="card">
            <h2 className="mb-4 font-display text-lg font-semibold">От выручки к чистой прибыли</h2>
            <dl className="space-y-2 text-sm">
              <Row label={dict.metrics.revenue} value={<Money amount={m.revenue} currency={c} />} />
              <Row label={`− ${dict.metrics.cogs}`} value={<Money amount={-m.cogs} currency={c} colorize />} muted />
              <Row label={dict.metrics.grossProfit} value={<Money amount={m.grossProfit} currency={c} />} strong />
              <Row label={`− ${dict.metrics.opex}`} value={<Money amount={-m.opex} currency={c} colorize />} muted />
              <Row label={dict.metrics.ebit} value={<Money amount={m.ebit} currency={c} />} strong />
              <Row label={`+ ${dict.metrics.depreciation}`} value={<Money amount={m.depreciation} currency={c} />} muted />
              <Row label={dict.metrics.ebitda} value={<Money amount={m.ebitda} currency={c} />} strong />
              <Row label={`− ${dict.metrics.interest}`} value={<Money amount={-m.interest} currency={c} colorize />} muted />
              <Row label={`− ${dict.metrics.taxes}`} value={<Money amount={-m.taxes} currency={c} colorize />} muted />
              <Row label={dict.metrics.netProfit} value={<Money amount={m.netProfit} currency={c} />} strong />
            </dl>
          </div>
        </Item>

        <div className="space-y-4">
          <Stagger className="grid grid-cols-2 gap-4">
            <MetricCard label={dict.metrics.cashFlow} amount={m.cashFlow} currency={c} colorize showSign />
            <Item>
              <div className="card">
                <div className="label">{dict.metrics.runway}</div>
                <div className="metric-value mt-2 text-2xl">
                  {m.runwayMonths == null ? <span className="text-positive">∞</span> : `${m.runwayMonths.toFixed(1)} ${dict.common.months}`}
                </div>
                <div className="mt-1 text-xs text-muted">
                  {m.burnRate > 0 ? <>Burn: <Money amount={m.burnRate} currency={c} />/мес</> : 'Прибыльно'}
                </div>
              </div>
            </Item>
          </Stagger>
          <Item>
            <div className="card">
              <h2 className="mb-2 font-display text-lg font-semibold">Структура расходов</h2>
              <ExpenseStructureChart cogs={m.cogs} opex={m.opex} taxes={m.taxes} interest={m.interest} depreciation={m.depreciation} currency={c} />
            </div>
          </Item>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label, amount, currency, colorize, showSign, sub, highlight,
}: {
  label: string; amount: number; currency: string; colorize?: boolean; showSign?: boolean; sub?: string; highlight?: boolean;
}) {
  return (
    <Item>
      <TiltCard>
        <div className={`card card-hover ${highlight ? 'ring-gradient' : ''}`}>
          <div className="label">{label}</div>
          <div className="metric-value mt-2 text-2xl">
            <MoneyCount amount={amount} currency={currency} colorize={colorize} showSign={showSign} />
          </div>
          {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
        </div>
      </TiltCard>
    </Item>
  );
}

function Row({ label, value, strong, muted }: { label: string; value: React.ReactNode; strong?: boolean; muted?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between py-1 ${strong ? 'border-t border-ink/8 pt-2 font-semibold' : ''} ${muted ? 'text-muted' : ''}`}>
      <dt>{label}</dt>
      <dd className="money">{value}</dd>
    </div>
  );
}

import { Money } from '@/components/cabinet/Money';
import { ExpenseStructureChart } from './ExpenseStructureChart';
import { computeMetrics } from '@/lib/metrics';
import { demoProject, demoProjectEntries, demoCashBalance } from '@/lib/demo';
import { dict } from '@/i18n/ru';

/** Бизнес-модуль «Мой проект» (§10, §15.2): дашборд метрик за период. */
export default function ProjectsPage() {
  const period = { from: '2026-01-01', to: '2026-06-30' }; // H1 2026
  const m = computeMetrics(demoProjectEntries, period, { cashBalance: demoCashBalance });
  const c = demoProject.currency;

  const fmtPct = (v: number | null) => (v == null ? dict.common.noData : `${v.toFixed(1)}%`);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl">{demoProject.name}</h1>
          <p className="text-sm text-ink/60">Период: 01.01.2026 — 30.06.2026 · валюта проекта {c}</p>
        </div>
        <span className="badge">6 месяцев</span>
      </header>

      {/* Дисклеймер (§10.2) */}
      <div className="bento bg-accent-soft/40 flex items-center gap-3 py-3">
        <span aria-hidden>ℹ️</span>
        <p className="text-sm text-ink/70">{dict.common.disclaimer}</p>
      </div>

      {/* Ключевые метрики — крупные числа (§10.3) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label={dict.metrics.revenue} value={<Money amount={m.revenue} currency={c} />} />
        <MetricCard label={dict.metrics.grossProfit} sub={`Маржа ${fmtPct(m.grossMarginPct)}`} value={<Money amount={m.grossProfit} currency={c} colorize />} />
        <MetricCard label={dict.metrics.ebitda} value={<Money amount={m.ebitda} currency={c} colorize />} highlight />
        <MetricCard label={dict.metrics.netProfit} sub={`Маржа ${fmtPct(m.netMarginPct)}`} value={<Money amount={m.netProfit} currency={c} colorize />} />
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        {/* Водопад P&L */}
        <div className="bento">
          <h2 className="font-display text-lg mb-4">От выручки к чистой прибыли</h2>
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

        {/* Структура расходов + cash */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard label={dict.metrics.cashFlow} value={<Money amount={m.cashFlow} currency={c} colorize showSign />} />
            <MetricCard
              label={dict.metrics.runway}
              value={m.runwayMonths == null ? <span className="text-positive">∞</span> : `${m.runwayMonths.toFixed(1)} ${dict.common.months}`}
              sub={m.burnRate > 0 ? <>Burn: <Money amount={m.burnRate} currency={c} />/мес</> : 'Прибыльно'}
            />
          </div>
          <div className="bento">
            <h2 className="font-display text-lg mb-2">Структура расходов</h2>
            <ExpenseStructureChart
              cogs={m.cogs}
              opex={m.opex}
              taxes={m.taxes}
              interest={m.interest}
              depreciation={m.depreciation}
              currency={c}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className={`bento ${highlight ? 'ring-2 ring-accent/40' : ''}`}>
      <div className="text-xs text-ink/50 mb-1">{label}</div>
      <div className="metric-value text-2xl">{value}</div>
      {sub && <div className="text-xs text-ink/50 mt-1">{sub}</div>}
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  muted,
}: {
  label: string;
  value: React.ReactNode;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className={`flex justify-between items-baseline py-1 ${strong ? 'border-t border-black/5 pt-2 font-medium' : ''} ${muted ? 'text-ink/60' : ''}`}>
      <dt>{label}</dt>
      <dd className="money">{value}</dd>
    </div>
  );
}

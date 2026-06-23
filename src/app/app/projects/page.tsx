'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLedger } from '@/lib/store/useLedger';
import { computeMetrics, type ProjectEntry } from '@/lib/metrics';
import { PageHeader, Item } from '@/components/cabinet/ui';
import { Money } from '@/components/cabinet/Money';
import { TiltCard } from '@/components/visual/TiltCard';
import { ProjectEntryForm } from './ProjectEntryForm';
import { ExpenseStructureChart } from './ExpenseStructureChart';
import { DatePicker } from '@/components/ui/DatePicker';
import { dict } from '@/i18n/ru';
import { IconPlus, IconChart, IconTrash } from '@/components/icons';

const RECUR_LABEL: Record<string, string> = { one_time: 'разово', daily: 'ежедн.', weekly: 'еженед.', monthly: 'ежемес.', quarterly: 'ежекварт.', yearly: 'ежегодно' };
const GROUP_LABEL: Record<string, string> = { cogs: 'COGS', opex: 'OPEX', taxes: 'Налоги', interest: 'Проценты', depreciation: 'Аморт.' };

export default function ProjectsPage() {
  const { hydrated, projects, addProject, deleteProject, entriesOf, deleteEntry } = useLedger();
  const [selected, setSelected] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  if (!hydrated) return <div className="py-20 text-center text-sm text-muted">Загрузка…</div>;

  const current = projects.find((p) => p.id === selected) ?? projects[0] ?? null;

  // Пустое состояние — пользователь создаёт свой проект.
  if (projects.length === 0) {
    return (
      <div>
        <PageHeader title="Мой проект" subtitle="Управленческие метрики вашего бизнеса" />
        <Item>
          <div className="card mx-auto max-w-lg space-y-4 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-grad-brand text-white"><IconChart size={26} /></span>
            <h3 className="font-display text-xl font-bold">Создайте первый проект</h3>
            <p className="text-sm text-muted">Заведите бизнес или мини-проект, вносите доходы и расходы — Holdy посчитает выручку, прибыль, EBITDA, cash flow и runway.</p>
            <form onSubmit={(e) => { e.preventDefault(); if (newName.trim()) { const p = addProject(newName.trim()); setSelected(p.id); setNewName(''); } }} className="flex flex-col gap-2 sm:flex-row">
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Название проекта" aria-label="Название проекта" className="flex-1 rounded-2xl border border-ink/10 bg-bg-2 px-4 py-2.5 text-sm outline-none focus:border-accent" />
              <button className="btn btn-primary"><IconPlus size={18} /> Создать</button>
            </form>
          </div>
        </Item>
      </div>
    );
  }

  return <ProjectView key={current!.id} projectId={current!.id} projects={projects} onSwitch={setSelected} onDelete={deleteProject} addProject={addProject} entriesOf={entriesOf} deleteEntry={deleteEntry} />;
}

function ProjectView({
  projectId, projects, onSwitch, onDelete, addProject, entriesOf, deleteEntry,
}: {
  projectId: string;
  projects: ReturnType<typeof useLedger>['projects'];
  onSwitch: (id: string) => void;
  onDelete: (id: string) => void;
  addProject: ReturnType<typeof useLedger>['addProject'];
  entriesOf: ReturnType<typeof useLedger>['entriesOf'];
  deleteEntry: ReturnType<typeof useLedger>['deleteEntry'];
}) {
  const project = projects.find((p) => p.id === projectId)!;
  const c = project.currency;
  const rows = entriesOf(projectId);
  const [from, setFrom] = useState(() => `${new Date().getFullYear()}-01-01`);
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [adding, setAdding] = useState(rows.length === 0);

  const entries: ProjectEntry[] = rows.map((r) => ({
    kind: r.kind, expenseGroup: r.expenseGroup, amount: r.amount, recurrence: r.recurrence, startDate: r.startDate, endDate: r.endDate,
  }));
  const m = computeMetrics(entries, { from, to }, { cashBalance: project.cashBalance });
  const fmtPct = (v: number | null) => (v == null ? dict.common.noData : `${v.toFixed(1)}%`);

  return (
    <div className="space-y-4">
      <PageHeader
        title={project.name}
        subtitle="Управленческая оценка, не бухгалтерская отчётность"
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => { const name = prompt('Название нового проекта'); if (name?.trim()) onSwitch(addProject(name.trim()).id); }} className="btn btn-secondary text-sm"><IconPlus size={16} /> Проект</button>
            <button onClick={() => { if (confirm(`Удалить проект «${project.name}»?`)) onDelete(project.id); }} className="btn btn-ghost text-sm text-muted"><IconTrash size={16} /></button>
          </div>
        }
      />

      {/* Переключатель проектов */}
      {projects.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {projects.map((p) => (
            <button key={p.id} onClick={() => onSwitch(p.id)} className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${p.id === projectId ? 'border-transparent bg-grad-brand text-white' : 'border-ink/10 text-muted hover:border-ink/20'}`}>{p.name}</button>
          ))}
        </div>
      )}

      {/* Период */}
      <div className="card flex flex-wrap items-center gap-3 py-3">
        <span className="text-sm font-medium text-muted">Период</span>
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <DatePicker className="min-w-[150px] flex-1" value={from} onChange={setFrom} ariaLabel="Начало периода" />
          <span className="text-muted">—</span>
          <DatePicker className="min-w-[150px] flex-1" value={to} onChange={setTo} ariaLabel="Конец периода" />
        </div>
      </div>

      {rows.length === 0 ? (
        <ProjectEntryForm projectId={projectId} currency={c} />
      ) : (
        <>
          {/* Метрики — компактные суммы, чтобы не вылезали */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard label={dict.metrics.revenue} amount={m.revenue} currency={c} />
            <MetricCard label={dict.metrics.grossProfit} amount={m.grossProfit} currency={c} colorize sub={`Маржа ${fmtPct(m.grossMarginPct)}`} />
            <MetricCard label={dict.metrics.ebitda} amount={m.ebitda} currency={c} colorize highlight />
            <MetricCard label={dict.metrics.netProfit} amount={m.netProfit} currency={c} colorize sub={`Маржа ${fmtPct(m.netMarginPct)}`} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="card">
              <h2 className="mb-3 font-display text-base font-semibold">От выручки к чистой прибыли</h2>
              <dl className="space-y-1.5 text-sm">
                <Row label={dict.metrics.revenue} value={<Money amount={m.revenue} currency={c} />} strong />
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

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <MetricCard label={dict.metrics.cashFlow} amount={m.cashFlow} currency={c} colorize showSign />
                <div className="card">
                  <div className="label">{dict.metrics.runway}</div>
                  <div className="metric-value mt-1 text-xl">
                    {m.runwayMonths == null ? <span className="text-positive">∞</span> : `${m.runwayMonths.toFixed(1)} ${dict.common.months}`}
                  </div>
                  <div className="mt-1 text-xs text-muted">{m.burnRate > 0 ? <>Burn: <Money amount={m.burnRate} currency={c} compact />/мес</> : 'Прибыльно'}</div>
                </div>
              </div>
              <div className="card">
                <h2 className="mb-2 font-display text-base font-semibold">Структура расходов</h2>
                <ExpenseStructureChart cogs={m.cogs} opex={m.opex} taxes={m.taxes} interest={m.interest} depreciation={m.depreciation} currency={c} />
              </div>
            </div>
          </div>

          {/* Записи проекта */}
          <div className="card">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold">Записи ({rows.length})</h2>
              <button onClick={() => setAdding((v) => !v)} className="btn btn-secondary text-sm"><IconPlus size={16} /> {adding ? 'Скрыть' : 'Запись'}</button>
            </div>
            <AnimatePresence>{adding && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
                <ProjectEntryForm projectId={projectId} currency={c} />
              </motion.div>
            )}</AnimatePresence>
            <ul className="divide-y divide-ink/8">
              {rows.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{r.note || (r.kind === 'income' ? 'Доход' : GROUP_LABEL[r.expenseGroup ?? 'opex'])}</div>
                    <div className="text-xs text-muted">{r.kind === 'income' ? 'Доход' : `Расход · ${GROUP_LABEL[r.expenseGroup ?? 'opex']}`} · {RECUR_LABEL[r.recurrence]} · с {r.startDate}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Money amount={r.kind === 'income' ? r.amount : -r.amount} currency={c} colorize compact />
                    <button onClick={() => deleteEntry(r.id)} aria-label="Удалить запись" className="rounded-full p-1.5 text-muted hover:bg-negative/10 hover:text-negative"><IconTrash size={15} /></button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, amount, currency, colorize, showSign, sub, highlight }: { label: string; amount: number; currency: string; colorize?: boolean; showSign?: boolean; sub?: string; highlight?: boolean }) {
  return (
    <TiltCard>
      <div className={`card card-hover ${highlight ? 'ring-gradient' : ''}`}>
        <div className="label truncate">{label}</div>
        <div className="metric-value mt-1.5 text-xl">
          <Money amount={amount} currency={currency} colorize={colorize} showSign={showSign} compact />
        </div>
        {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
      </div>
    </TiltCard>
  );
}

function Row({ label, value, strong, muted }: { label: string; value: React.ReactNode; strong?: boolean; muted?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-3 py-1 ${strong ? 'border-t border-ink/8 pt-1.5 font-semibold first:border-0' : ''} ${muted ? 'text-muted' : ''}`}>
      <dt className="min-w-0 truncate">{label}</dt>
      <dd className="money shrink-0">{value}</dd>
    </div>
  );
}

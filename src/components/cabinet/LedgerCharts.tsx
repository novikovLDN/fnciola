'use client';

import { useState } from 'react';
import { EChart, CHART_PALETTE } from '@/components/cabinet/EChart';
import { useLedger } from '@/lib/store/useLedger';
import { getCategory } from '@/config/categories';
import { minorToMajorNumber } from '@/lib/money';

type Segment = 'weekday' | 'month' | 'quarter' | 'year';

const SEGMENTS: { id: Segment; label: string }[] = [
  { id: 'weekday', label: 'Дни недели' },
  { id: 'month', label: 'Месяцы' },
  { id: 'quarter', label: 'Кварталы' },
  { id: 'year', label: 'Годы' },
];

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS_SHORT = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

function bucketKey(dateStr: string, seg: Segment): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  switch (seg) {
    case 'weekday': return WEEKDAYS[(d.getUTCDay() + 6) % 7];
    case 'month': return `${MONTHS_SHORT[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`;
    case 'quarter': return `Q${Math.floor(d.getUTCMonth() / 3) + 1} ${d.getUTCFullYear()}`;
    case 'year': return String(d.getUTCFullYear());
  }
}

/** Аналитика из реального леджера: динамика по сегментам + структура расходов. */
export function LedgerCharts() {
  const { txs, currency } = useLedger();
  const [seg, setSeg] = useState<Segment>('month');

  // Сегментная динамика (сохраняем порядок появления; для weekday — фикс. порядок)
  const order: string[] = seg === 'weekday' ? [...WEEKDAYS] : [];
  const buckets = new Map<string, { inc: number; exp: number }>();
  if (seg === 'weekday') for (const w of WEEKDAYS) buckets.set(w, { inc: 0, exp: 0 });
  for (const t of [...txs].sort((a, b) => (a.occurredAt < b.occurredAt ? -1 : 1))) {
    const k = bucketKey(t.occurredAt, seg);
    if (!buckets.has(k)) { buckets.set(k, { inc: 0, exp: 0 }); if (seg !== 'weekday') order.push(k); }
    const b = buckets.get(k)!;
    if (t.direction === 'income') b.inc += t.amountMinor; else b.exp += t.amountMinor;
  }
  const cats = seg === 'weekday' ? WEEKDAYS : order;
  const incData = cats.map((k) => minorToMajorNumber(buckets.get(k)?.inc ?? 0, currency));
  const expData = cats.map((k) => minorToMajorNumber(buckets.get(k)?.exp ?? 0, currency));

  // Структура расходов
  const byCat = new Map<string, number>();
  for (const t of txs) if (t.direction === 'expense') byCat.set(t.categoryKey, (byCat.get(t.categoryKey) ?? 0) + t.amountMinor);
  const pie = [...byCat.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => ({ name: getCategory(k).label, value: minorToMajorNumber(v, currency), itemStyle: { color: getCategory(k).color } }));

  const axisFmt = (v: number) => {
    const a = Math.abs(v);
    if (a >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace('.0', '')}м`;
    if (a >= 1_000) return `${Math.round(v / 1_000)}к`;
    return String(v);
  };

  if (txs.length === 0) {
    return <div className="card py-12 text-center text-sm text-muted">Добавьте операции — здесь появится аналитика.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Переключатель сегментов */}
      <div className="flex flex-wrap gap-2">
        {SEGMENTS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSeg(s.id)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${seg === s.id ? 'border-transparent bg-grad-brand text-white' : 'border-ink/10 text-muted hover:border-ink/20'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-display text-base font-semibold">Доходы и расходы</h2>
          <EChart
            ariaLabel="Доходы и расходы по сегментам"
            option={{
              tooltip: { trigger: 'axis', backgroundColor: '#fff', borderColor: 'rgba(17,17,19,0.1)', textStyle: { color: '#0D0D0F' } },
              legend: { data: ['Доход', 'Расход'], bottom: 0, textStyle: { color: '#6C6E76' }, icon: 'roundRect' },
              grid: { left: 48, right: 14, top: 14, bottom: 40 },
              xAxis: { type: 'category', data: cats, axisLabel: { color: '#6C6E76', interval: 0, hideOverlap: true }, axisLine: { lineStyle: { color: 'rgba(17,17,19,0.12)' } }, axisTick: { show: false } },
              yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(17,17,19,0.06)' } }, axisLabel: { color: '#6C6E76', formatter: axisFmt } },
              series: [
                { name: 'Доход', type: 'bar', data: incData, itemStyle: { color: '#15A35B', borderRadius: [6, 6, 0, 0] }, barMaxWidth: 22 },
                { name: 'Расход', type: 'bar', data: expData, itemStyle: { color: '#F24E1E', borderRadius: [6, 6, 0, 0] }, barMaxWidth: 22 },
              ],
            }}
          />
        </div>

        <div className="card">
          <h2 className="mb-3 font-display text-base font-semibold">Структура расходов</h2>
          {pie.length === 0 ? (
            <div className="flex h-56 items-center justify-center text-sm text-muted">Расходов пока нет.</div>
          ) : (
            <EChart
              ariaLabel="Структура расходов по категориям"
              option={{
                tooltip: { trigger: 'item', formatter: '{b}: {c} ₽ ({d}%)' },
                legend: { bottom: 0, type: 'scroll', textStyle: { color: '#6C6E76' } },
                series: [{ type: 'pie', radius: ['54%', '76%'], avoidLabelOverlap: true, itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 3 }, label: { show: true, color: '#0D0D0F', formatter: '{d}%' }, data: pie }],
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

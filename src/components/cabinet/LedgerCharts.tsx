'use client';

import { EChart, CHART_PALETTE } from '@/components/cabinet/EChart';
import * as echarts from 'echarts';
import { useLedger } from '@/lib/store/useLedger';
import { getCategory } from '@/config/categories';
import { minorToMajorNumber } from '@/lib/money';

/** Аналитика из реального леджера: динамика по месяцам + структура расходов. */
export function LedgerCharts() {
  const { txs, currency } = useLedger();

  // Динамика по месяцам
  const monthly = new Map<string, { inc: number; exp: number }>();
  for (const t of txs) {
    const key = t.occurredAt.slice(0, 7);
    const m = monthly.get(key) ?? { inc: 0, exp: 0 };
    if (t.direction === 'income') m.inc += t.amountMinor;
    else m.exp += t.amountMinor;
    monthly.set(key, m);
  }
  const months = [...monthly.keys()].sort();
  const incData = months.map((k) => minorToMajorNumber(monthly.get(k)!.inc, currency));
  const expData = months.map((k) => minorToMajorNumber(monthly.get(k)!.exp, currency));

  // Структура расходов по категориям
  const byCat = new Map<string, number>();
  for (const t of txs) {
    if (t.direction !== 'expense') continue;
    byCat.set(t.categoryKey, (byCat.get(t.categoryKey) ?? 0) + t.amountMinor);
  }
  const pie = [...byCat.entries()].map(([k, v]) => ({
    name: getCategory(k).label,
    value: minorToMajorNumber(v, currency),
    itemStyle: { color: getCategory(k).color },
  }));

  if (txs.length === 0) {
    return <div className="card py-12 text-center text-sm text-muted">Добавьте операции — здесь появится аналитика.</div>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card">
        <h2 className="mb-3 font-display text-base font-semibold">Динамика по месяцам</h2>
        <EChart
          ariaLabel="Доходы и расходы по месяцам"
          option={{
            tooltip: { trigger: 'axis', backgroundColor: '#fff', borderColor: 'rgba(17,17,19,0.1)', textStyle: { color: '#0D0D0F' } },
            legend: { data: ['Доход', 'Расход'], bottom: 0, textStyle: { color: '#6C6E76' } },
            grid: { left: 40, right: 12, top: 12, bottom: 40 },
            xAxis: { type: 'category', data: months, boundaryGap: false, axisLabel: { color: '#6C6E76' }, axisLine: { lineStyle: { color: 'rgba(17,17,19,0.12)' } } },
            yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(17,17,19,0.06)' } }, axisLabel: { color: '#6C6E76' } },
            series: [
              { name: 'Доход', type: 'line', smooth: true, symbol: 'circle', symbolSize: 7, data: incData, lineStyle: { width: 3, color: '#15A35B' }, itemStyle: { color: '#15A35B' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(21,163,91,0.25)' }, { offset: 1, color: 'rgba(21,163,91,0)' }]) } },
              { name: 'Расход', type: 'line', smooth: true, symbol: 'circle', symbolSize: 7, data: expData, lineStyle: { width: 3, color: '#F24E1E' }, itemStyle: { color: '#F24E1E' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(242,78,30,0.22)' }, { offset: 1, color: 'rgba(242,78,30,0)' }]) } },
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
              color: CHART_PALETTE,
              tooltip: { trigger: 'item', formatter: '{b}: {c} ₽ ({d}%)' },
              legend: { bottom: 0, type: 'scroll', textStyle: { color: '#6C6E76' } },
              series: [{ type: 'pie', radius: ['54%', '76%'], avoidLabelOverlap: true, itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 3 }, label: { show: true, color: '#0D0D0F', formatter: '{d}%' }, data: pie }],
            }}
          />
        )}
      </div>
    </div>
  );
}

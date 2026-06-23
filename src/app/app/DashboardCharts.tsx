'use client';

import { EChart, CHART_PALETTE } from '@/components/cabinet/EChart';
import * as echarts from 'echarts';
import { demoTransactions } from '@/lib/demo';
import { minorToMajorNumber } from '@/lib/money';

/** Графики дашборда: динамика и структура расходов (§15.2, §10.3). */
export function DashboardCharts() {
  const byCategory = new Map<string, number>();
  for (const t of demoTransactions) {
    if (t.direction === 'expense') {
      byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + Math.abs(t.amountDisplayMinor));
    }
  }
  const pieData = [...byCategory.entries()].map(([name, v]) => ({ name, value: minorToMajorNumber(v, 'RUB') }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card">
        <h2 className="mb-2 font-display text-lg font-semibold">Динамика, тыс. ₽</h2>
        <EChart
          ariaLabel="Динамика доходов и расходов по месяцам"
          option={{
            tooltip: { trigger: 'axis' },
            legend: { data: ['Доход', 'Расход'], bottom: 0, textStyle: { color: '#9A9CB8' } },
            grid: { left: 36, right: 12, top: 12, bottom: 40 },
            xAxis: { type: 'category', data: ['Фев', 'Мар', 'Апр', 'Май', 'Июн'], boundaryGap: false, axisLabel: { color: '#9A9CB8' }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } },
            yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#9A9CB8' } },
            series: [
              {
                name: 'Доход', type: 'line', smooth: true, symbol: 'none', data: [120, 135, 128, 150, 160],
                lineStyle: { width: 3, color: '#2DE0A6' },
                areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(45,224,166,0.35)' }, { offset: 1, color: 'rgba(45,224,166,0)' }]) },
              },
              {
                name: 'Расход', type: 'line', smooth: true, symbol: 'none', data: [90, 110, 95, 105, 98],
                lineStyle: { width: 3, color: '#FF5C7C' },
                areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(255,92,124,0.3)' }, { offset: 1, color: 'rgba(255,92,124,0)' }]) },
              },
            ],
          }}
        />
      </div>

      <div className="card">
        <h2 className="mb-2 font-display text-lg font-semibold">Структура расходов</h2>
        <EChart
          ariaLabel="Структура расходов по категориям"
          option={{
            color: CHART_PALETTE,
            tooltip: { trigger: 'item', formatter: '{b}: {c} ₽ ({d}%)' },
            legend: { bottom: 0, type: 'scroll', textStyle: { color: '#9A9CB8' } },
            series: [
              {
                type: 'pie', radius: ['52%', '74%'], avoidLabelOverlap: true,
                itemStyle: { borderRadius: 10, borderColor: 'rgba(7,8,20,1)', borderWidth: 3 },
                label: { show: true, color: '#EDEEF8', formatter: '{b}\n{d}%' },
                data: pieData,
              },
            ],
          }}
        />
      </div>
    </div>
  );
}

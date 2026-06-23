'use client';

import { EChart, CHART_PALETTE } from '@/components/cabinet/EChart';
import { demoTransactions } from '@/lib/demo';
import { minorToMajorNumber } from '@/lib/money';

/** Графики дашборда: динамика и структура расходов (§15.2, §10.3). */
export function DashboardCharts() {
  // Структура расходов по категориям
  const byCategory = new Map<string, number>();
  for (const t of demoTransactions) {
    if (t.direction === 'expense') {
      const abs = Math.abs(t.amountDisplayMinor);
      byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + abs);
    }
  }
  const pieData = [...byCategory.entries()].map(([name, v]) => ({
    name,
    value: minorToMajorNumber(v, 'RUB'),
  }));

  const trendDates = ['Фев', 'Мар', 'Апр', 'Май', 'Июн'];
  const incomeTrend = [120, 135, 128, 150, 160];
  const expenseTrend = [90, 110, 95, 105, 98];

  return (
    <section className="grid lg:grid-cols-2 gap-4">
      <div className="bento">
        <h2 className="font-display text-lg mb-2">Динамика, тыс. ₽</h2>
        <EChart
          ariaLabel="График динамики доходов и расходов по месяцам"
          option={{
            color: [CHART_PALETTE[2], CHART_PALETTE[3]],
            tooltip: { trigger: 'axis' },
            legend: { data: ['Доход', 'Расход'], bottom: 0 },
            grid: { left: 40, right: 16, top: 16, bottom: 40 },
            xAxis: { type: 'category', data: trendDates, boundaryGap: false },
            yAxis: { type: 'value' },
            series: [
              { name: 'Доход', type: 'line', smooth: true, areaStyle: { opacity: 0.15 }, data: incomeTrend },
              { name: 'Расход', type: 'line', smooth: true, areaStyle: { opacity: 0.15 }, data: expenseTrend },
            ],
          }}
        />
      </div>

      <div className="bento">
        <h2 className="font-display text-lg mb-2">Структура расходов</h2>
        <EChart
          ariaLabel="Круговая диаграмма структуры расходов по категориям"
          option={{
            color: CHART_PALETTE,
            tooltip: { trigger: 'item', formatter: '{b}: {c} ₽ ({d}%)' },
            legend: { bottom: 0, type: 'scroll' },
            series: [
              {
                type: 'pie',
                radius: ['45%', '70%'],
                avoidLabelOverlap: true,
                itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
                label: { show: true, formatter: '{b}\n{d}%' },
                data: pieData,
              },
            ],
          }}
        />
      </div>
    </section>
  );
}

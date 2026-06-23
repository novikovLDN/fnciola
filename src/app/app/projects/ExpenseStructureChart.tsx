'use client';

import { EChart, CHART_PALETTE } from '@/components/cabinet/EChart';
import { minorToMajorNumber } from '@/lib/money';

/** Структура расходов проекта по группам (§10.3). */
export function ExpenseStructureChart({
  cogs, opex, taxes, interest, depreciation, currency,
}: {
  cogs: number; opex: number; taxes: number; interest: number; depreciation: number; currency: string;
}) {
  const data = [
    { name: 'COGS', value: minorToMajorNumber(cogs, currency) },
    { name: 'OPEX', value: minorToMajorNumber(opex, currency) },
    { name: 'Налоги', value: minorToMajorNumber(taxes, currency) },
    { name: 'Проценты', value: minorToMajorNumber(interest, currency) },
    { name: 'Амортизация', value: minorToMajorNumber(depreciation, currency) },
  ].filter((d) => d.value > 0);

  return (
    <EChart
      height={240}
      ariaLabel="Структура расходов проекта по группам"
      option={{
        color: CHART_PALETTE,
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { bottom: 0, type: 'scroll', textStyle: { color: '#9A9CB8' } },
        series: [
          {
            type: 'pie', radius: ['52%', '74%'],
            itemStyle: { borderRadius: 10, borderColor: 'rgba(7,8,20,1)', borderWidth: 3 },
            label: { show: true, color: '#EDEEF8', formatter: '{d}%' },
            data,
          },
        ],
      }}
    />
  );
}

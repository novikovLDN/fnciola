/**
 * Тарифные планы Premium-подписки (§12 ТЗ).
 * Цены и скидки вынесены в конфиг — можно скорректировать без правки кода.
 * Суммы — в минорных единицах (копейках) RUB.
 */

export type PlanId = 'm1' | 'm3' | 'm6' | 'm12';

export interface Plan {
  id: PlanId;
  months: number;
  priceMinor: number; // копейки RUB
  title: string;
  /** Скидка к цене 1 месяца, % (для бейджа). */
  discountPct: number;
  popular?: boolean;
}

export const CURRENCY_PLANS = 'RUB';

export const PLANS: Plan[] = [
  { id: 'm1', months: 1, priceMinor: 19900, title: '1 месяц', discountPct: 0 },
  { id: 'm3', months: 3, priceMinor: 49900, title: '3 месяца', discountPct: 16 },
  { id: 'm6', months: 6, priceMinor: 89900, title: '6 месяцев', discountPct: 25, popular: true },
  { id: 'm12', months: 12, priceMinor: 149000, title: '12 месяцев', discountPct: 38 },
];

export function getPlan(id: PlanId): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

/** Цена в пересчёте на месяц (минорные единицы), для отображения. */
export function pricePerMonthMinor(plan: Plan): number {
  return Math.round(plan.priceMinor / plan.months);
}

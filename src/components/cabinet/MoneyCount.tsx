'use client';

import { CountUp } from '@/components/visual/CountUp';
import { formatMoney, formatCompactMoney, signOf, type Minor } from '@/lib/money';

/** Анимированная денежная сумма (count-up) с семантикой знака. */
export function MoneyCount({
  amount,
  currency,
  colorize = false,
  showSign = false,
  compact = false,
  className = '',
}: {
  amount: Minor;
  currency: string;
  colorize?: boolean;
  showSign?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const sign = signOf(amount);
  const color = colorize && sign === 'positive' ? 'text-positive' : colorize && sign === 'negative' ? 'text-negative' : '';
  const format = (v: number) =>
    compact ? formatCompactMoney(Math.round(v), currency, { showSign }) : formatMoney(Math.round(v), currency, { showSign });
  return (
    <span className={`money ${color} ${className}`}>
      {colorize && sign !== 'zero' && <span aria-hidden className="mr-1 text-[0.6em] align-middle opacity-80">{sign === 'positive' ? '▲' : '▼'}</span>}
      <CountUp to={amount} format={format} />
    </span>
  );
}

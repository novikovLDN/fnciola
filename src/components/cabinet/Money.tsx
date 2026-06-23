import { formatMoney, signOf, type Minor } from '@/lib/money';

/**
 * Денежное значение. Прибыль/убыток различаются НЕ только цветом (доступность):
 * добавляем стрелку-иконку и скрытую текстовую подпись для скринридеров.
 */
export function Money({
  amount,
  currency,
  colorize = false,
  showSign = false,
  className = '',
}: {
  amount: Minor;
  currency: string;
  colorize?: boolean;
  showSign?: boolean;
  className?: string;
}) {
  const sign = signOf(amount);
  const colorClass =
    colorize && sign === 'positive' ? 'text-positive' : colorize && sign === 'negative' ? 'text-negative' : '';
  const srLabel = sign === 'positive' ? 'доход' : sign === 'negative' ? 'расход' : '';

  return (
    <span className={`money whitespace-nowrap ${colorClass} ${className}`}>
      {colorize && sign !== 'zero' && (
        <span aria-hidden className="mr-1 text-[0.7em] align-middle opacity-80">
          {sign === 'positive' ? '▲' : '▼'}
        </span>
      )}
      {formatMoney(amount, currency, { showSign })}
      {srLabel && <span className="sr-only"> ({srLabel})</span>}
    </span>
  );
}

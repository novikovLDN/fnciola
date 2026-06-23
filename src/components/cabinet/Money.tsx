import { formatMoney, signOf, type Minor } from '@/lib/money';

/**
 * Денежное значение с семантикой знака — прибыль/убыток различаются НЕ только
 * цветом (§5.2, §14.2): добавляем знак и текстовую подпись для скринридеров.
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
    <span className={`money ${colorClass} ${className}`}>
      {colorize && sign !== 'zero' && (
        <span aria-hidden className="mr-0.5">
          {sign === 'positive' ? '▲' : '▼'}
        </span>
      )}
      {formatMoney(amount, currency, { showSign })}
      {srLabel && <span className="sr-only"> ({srLabel})</span>}
    </span>
  );
}

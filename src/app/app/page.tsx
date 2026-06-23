import { Money } from '@/components/cabinet/Money';
import { DashboardCharts } from './DashboardCharts';
import { demoAccounts, demoTransactions, DISPLAY_CURRENCY } from '@/lib/demo';
import { sum } from '@/lib/money';
import { dict } from '@/i18n/ru';

/** Dashboard (§15.2): ключевые числа, графики, последние операции, инсайты. */
export default function DashboardPage() {
  const totalBalance = sum(demoAccounts.map((a) => a.balanceMinor));
  const income = sum(demoTransactions.filter((t) => t.direction === 'income').map((t) => t.amountDisplayMinor));
  const expense = sum(demoTransactions.filter((t) => t.direction === 'expense').map((t) => t.amountDisplayMinor));
  const net = income + expense;

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl">{dict.nav.dashboard}</h1>
          <p className="text-sm text-ink/60">Июнь 2026 · все счета сведены в {DISPLAY_CURRENCY}</p>
        </div>
        <span className="badge">Период: текущий месяц</span>
      </header>

      {/* Ключевые числа — крупные «живые» цифры (§14.3) */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bento">
          <div className="text-sm text-ink/50 mb-1">{dict.common.balance}</div>
          <div className="metric-value"><Money amount={totalBalance} currency={DISPLAY_CURRENCY} /></div>
        </div>
        <div className="bento">
          <div className="text-sm text-ink/50 mb-1">{dict.common.income}</div>
          <div className="metric-value text-positive"><Money amount={income} currency={DISPLAY_CURRENCY} colorize /></div>
        </div>
        <div className="bento">
          <div className="text-sm text-ink/50 mb-1">{dict.common.expense}</div>
          <div className="metric-value text-negative"><Money amount={expense} currency={DISPLAY_CURRENCY} colorize /></div>
        </div>
      </section>

      {/* Инсайт (§15.2) */}
      <div className="bento bg-accent-soft/50 flex items-center gap-3">
        <span className="text-2xl" aria-hidden>💡</span>
        <p className="text-sm">
          Чистый результат за месяц — <Money amount={net} currency={DISPLAY_CURRENCY} colorize showSign className="font-medium" />.
          {net >= 0 ? ' Вы откладываете больше, чем тратите.' : ' Расходы превысили доходы — стоит присмотреться к крупным тратам.'}
        </p>
      </div>

      <DashboardCharts />

      {/* Последние операции (§15.2) */}
      <section className="bento">
        <h2 className="font-display text-lg mb-4">Последние операции</h2>
        <ul className="divide-y divide-black/5">
          {demoTransactions.slice().reverse().map((t) => (
            <li key={t.id} className="flex items-center justify-between py-3 gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{t.description}</div>
                <div className="text-xs text-ink/50">{t.category} · {t.occurredAt}</div>
              </div>
              <div className="text-right shrink-0">
                <Money amount={t.amountDisplayMinor} currency={DISPLAY_CURRENCY} colorize showSign />
                {t.currencyOriginal !== DISPLAY_CURRENCY && (
                  <div className="text-xs text-ink/40">
                    ориг.: <Money amount={t.amountOriginalMinor} currency={t.currencyOriginal} />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

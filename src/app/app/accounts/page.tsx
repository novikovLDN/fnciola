import { Money } from '@/components/cabinet/Money';
import { demoAccounts } from '@/lib/demo';

const TYPE_LABEL: Record<string, string> = { cash: 'Наличные', card: 'Карта', bank: 'Банк', other: 'Другое' };

/** Счета (§15.2): список, добавление, валюта, архивирование. */
export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-display text-2xl sm:text-3xl">Счета</h1>
        <button className="btn-accent">+ Новый счёт</button>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {demoAccounts.map((a) => (
          <div key={a.id} className="bento">
            <div className="flex items-center justify-between mb-3">
              <span className="badge">{TYPE_LABEL[a.type]}</span>
              <span className="text-xs text-ink/40">{a.currency}</span>
            </div>
            <div className="font-medium mb-1">{a.name}</div>
            <div className="metric-value text-2xl"><Money amount={a.balanceMinor} currency={a.currency} /></div>
            <div className="mt-4 flex gap-2">
              <button className="btn-ghost text-xs px-3 py-1.5">Изменить</button>
              <button className="btn-ghost text-xs px-3 py-1.5">В архив</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

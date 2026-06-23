import { Money } from '@/components/cabinet/Money';
import { demoTransactions, demoAccounts, DISPLAY_CURRENCY } from '@/lib/demo';

/** Операции (§15.2): список с фильтрами, поиск, добавление. Демо-вид. */
export default function TransactionsPage() {
  const accountName = (id: string) => demoAccounts.find((a) => a.id === id)?.name ?? '—';

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-display text-2xl sm:text-3xl">Операции</h1>
        <button className="btn-accent">+ Добавить</button>
      </header>

      {/* Фильтры (§15.2) */}
      <div className="bento flex flex-wrap gap-2 items-center py-3">
        <select className="rounded-pill border border-black/10 bg-bg px-4 py-2 text-sm" aria-label="Период" defaultValue="month">
          <option value="month">Текущий месяц</option>
          <option value="quarter">Квартал</option>
          <option value="year">Год</option>
        </select>
        <select className="rounded-pill border border-black/10 bg-bg px-4 py-2 text-sm" aria-label="Счёт" defaultValue="">
          <option value="">Все счета</option>
          {demoAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select className="rounded-pill border border-black/10 bg-bg px-4 py-2 text-sm" aria-label="Тип" defaultValue="">
          <option value="">Доход и расход</option>
          <option value="income">Доход</option>
          <option value="expense">Расход</option>
        </select>
        <input className="rounded-pill border border-black/10 bg-bg px-4 py-2 text-sm flex-1 min-w-[160px]" placeholder="Поиск по описанию…" aria-label="Поиск" />
      </div>

      <div className="bento p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-accent-soft/40 text-left text-ink/60">
            <tr>
              <th className="px-4 py-3 font-medium">Дата</th>
              <th className="px-4 py-3 font-medium">Описание</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Счёт</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Категория</th>
              <th className="px-4 py-3 font-medium text-right">Сумма</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {demoTransactions.slice().reverse().map((t) => (
              <tr key={t.id} className="hover:bg-black/[0.02]">
                <td className="px-4 py-3 whitespace-nowrap tnum">{t.occurredAt}</td>
                <td className="px-4 py-3">{t.description}</td>
                <td className="px-4 py-3 hidden sm:table-cell text-ink/60">{accountName(t.accountId)}</td>
                <td className="px-4 py-3 hidden sm:table-cell"><span className="badge">{t.category}</span></td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Money amount={t.amountDisplayMinor} currency={DISPLAY_CURRENCY} colorize showSign />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-ink/40 text-center">Для длинных списков — пагинация/виртуализация (§5.2).</p>
    </div>
  );
}

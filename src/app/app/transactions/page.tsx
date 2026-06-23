'use client';

import { Item, PageHeader } from '@/components/cabinet/ui';
import { Money } from '@/components/cabinet/Money';
import { demoTransactions, demoAccounts, DISPLAY_CURRENCY } from '@/lib/demo';

/** Операции (§15.2): фильтры, поиск, список. */
export default function TransactionsPage() {
  const accountName = (id: string) => demoAccounts.find((a) => a.id === id)?.name ?? '—';

  return (
    <div>
      <PageHeader title="Операции" action={<button className="btn btn-primary">+ Добавить</button>} />

      <Item>
        <div className="card mb-4 flex flex-wrap items-center gap-2 py-3">
          {[
            { label: 'Период', opts: ['Текущий месяц', 'Квартал', 'Год'] },
            { label: 'Счёт', opts: ['Все счета', ...demoAccounts.map((a) => a.name)] },
            { label: 'Тип', opts: ['Доход и расход', 'Доход', 'Расход'] },
          ].map((f) => (
            <select key={f.label} aria-label={f.label} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-ink outline-none">
              {f.opts.map((o) => <option key={o} className="bg-bg-2">{o}</option>)}
            </select>
          ))}
          <input className="min-w-[160px] flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none placeholder:text-muted" placeholder="Поиск по описанию…" aria-label="Поиск" />
        </div>
      </Item>

      <Item>
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Дата</th>
                <th className="px-4 py-3 font-medium">Описание</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Счёт</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Категория</th>
                <th className="px-4 py-3 text-right font-medium">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {demoTransactions.slice().reverse().map((t) => (
                <tr key={t.id} className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.03]">
                  <td className="whitespace-nowrap px-4 py-3 tnum text-muted">{t.occurredAt}</td>
                  <td className="px-4 py-3 font-medium">{t.description}</td>
                  <td className="hidden px-4 py-3 text-muted sm:table-cell">{accountName(t.accountId)}</td>
                  <td className="hidden px-4 py-3 sm:table-cell"><span className="badge">{t.category}</span></td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Money amount={t.amountDisplayMinor} currency={DISPLAY_CURRENCY} colorize showSign />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Item>
      <p className="mt-3 text-center text-xs text-muted">Для длинных списков — пагинация/виртуализация (§5.2).</p>
    </div>
  );
}

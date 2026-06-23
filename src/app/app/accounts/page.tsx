'use client';

import { Stagger, Item, PageHeader } from '@/components/cabinet/ui';
import { TiltCard } from '@/components/visual/TiltCard';
import { MoneyCount } from '@/components/cabinet/MoneyCount';
import { demoAccounts } from '@/lib/demo';

const TYPE_LABEL: Record<string, string> = { cash: 'Наличные', card: 'Карта', bank: 'Банк', other: 'Другое' };

/** Счета (§15.2): список, валюта, архивирование. */
export default function AccountsPage() {
  return (
    <div>
      <PageHeader title="Счета" action={<button className="btn btn-primary">+ Новый счёт</button>} />

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {demoAccounts.map((a) => (
          <Item key={a.id}>
            <TiltCard>
              <div className="card card-hover">
                <div className="mb-3 flex items-center justify-between">
                  <span className="badge">{TYPE_LABEL[a.type]}</span>
                  <span className="text-xs text-muted">{a.currency}</span>
                </div>
                <div className="font-medium">{a.name}</div>
                <div className="metric-value mt-1 text-2xl">
                  <MoneyCount amount={a.balanceMinor} currency={a.currency} />
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="btn btn-ghost px-3 py-1.5 text-xs">Изменить</button>
                  <button className="btn btn-ghost px-3 py-1.5 text-xs">В архив</button>
                </div>
              </div>
            </TiltCard>
          </Item>
        ))}
      </Stagger>
    </div>
  );
}

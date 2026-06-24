'use client';

import { useState } from 'react';
import { Stagger, Item, PageHeader } from '@/components/cabinet/ui';
import { TiltCard } from '@/components/visual/TiltCard';
import { Money } from '@/components/cabinet/Money';
import { useLedger } from '@/lib/store/useLedger';
import { ImportPanel } from '@/components/cabinet/ImportPanel';
import { IconPlus, IconWallet } from '@/components/icons';

/** Счета: список из леджера с реальными балансами. */
export default function AccountsPage() {
  const { accounts, accountBalance, addAccount } = useLedger();
  const [name, setName] = useState('');

  return (
    <div>
      <PageHeader title="Счета" subtitle={`${accounts.length} счёт(ов)`} />

      <Item className="mb-4">
        <form
          onSubmit={(e) => { e.preventDefault(); if (name.trim()) { addAccount(name.trim()); setName(''); } }}
          className="card flex flex-wrap items-center gap-2"
        >
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название счёта (напр. Карта)" aria-label="Название счёта" className="min-w-[180px] flex-1 rounded-full border border-ink/10 bg-bg-2 px-4 py-2.5 text-sm outline-none placeholder:text-muted" />
          <button className="btn btn-primary"><IconPlus size={18} /> Добавить счёт</button>
        </form>
      </Item>

      {accounts.length === 0 ? (
        <Item><div className="card py-10 text-center text-sm text-muted">Счёт создастся автоматически при первой операции — или добавьте вручную выше.</div></Item>
      ) : (
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => (
            <Item key={a.id}>
              <TiltCard>
                <div className="card card-hover">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-grad-brand text-white"><IconWallet size={20} /></span>
                    <span className="text-xs text-muted">{a.currency}</span>
                  </div>
                  <div className="font-medium">{a.name}</div>
                  <div className="metric-value mt-1 text-2xl">
                    <Money amount={accountBalance(a.id)} currency={a.currency} colorize={accountBalance(a.id) < 0} />
                  </div>
                </div>
              </TiltCard>
            </Item>
          ))}
        </Stagger>
      )}

      {/* Импорт выписок — пополнение счёта из файла банка */}
      <Item className="mt-8">
        <div className="mb-1 border-t border-ink/8 pt-8">
          <h2 className="font-display text-xl font-bold">Импорт выписок</h2>
          <p className="mt-1 text-sm text-muted">Загрузите файл из банка — операции добавятся автоматически с категориями.</p>
        </div>
      </Item>
      <Item><ImportPanel /></Item>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Item, PageHeader } from '@/components/cabinet/ui';
import { OpsList } from '@/components/cabinet/OpsList';
import { AddPanel } from '@/components/cabinet/AddPanel';
import { useLedger } from '@/lib/store/useLedger';
import { IconPlus } from '@/components/icons';

/** Операции (§15.2): полный список из леджера + быстрое добавление. */
export default function TransactionsPage() {
  const { txs } = useLedger();
  const [adding, setAdding] = useState(false);

  return (
    <div>
      <PageHeader
        title="Операции"
        subtitle={`Всего: ${txs.length}`}
        action={
          <button onClick={() => setAdding((v) => !v)} className="btn btn-primary">
            <IconPlus size={18} /> {adding ? 'Скрыть' : 'Добавить'}
          </button>
        }
      />

      {adding && (
        <Item className="mb-4">
          <div className="mx-auto max-w-xl">
            <AddPanel onAdded={() => setAdding(false)} />
          </div>
        </Item>
      )}

      <Item>
        <div className="card">
          <OpsList />
        </div>
      </Item>
    </div>
  );
}

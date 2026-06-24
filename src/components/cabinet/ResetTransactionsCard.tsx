'use client';

import { useState } from 'react';
import { useLedger } from '@/lib/store/useLedger';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { IconTrash } from '@/components/icons';

/** Опасная зона: сброс всех операций с двойным подтверждением. */
export function ResetTransactionsCard() {
  const { txs, clearTransactions } = useLedger();
  const [step, setStep] = useState<0 | 1 | 2>(0); // 0 — закрыто, 1 — первое, 2 — второе
  const [done, setDone] = useState(false);
  const count = txs.length;

  function finalReset() {
    clearTransactions();
    setStep(0);
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  }

  return (
    <section className="card space-y-3 border-negative/20">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-semibold text-negative">Опасная зона</h2>
          <p className="text-sm text-muted">Удалить все операции без возможности восстановления. Счета и проекты останутся.</p>
        </div>
        <button
          onClick={() => setStep(1)}
          disabled={count === 0}
          className="btn shrink-0 text-white disabled:opacity-40"
          style={{ background: 'rgb(var(--negative))' }}
        >
          <IconTrash size={16} /> Сбросить все транзакции
        </button>
      </div>
      {done && <p className="text-sm text-positive">Все операции удалены ✓</p>}
      {count === 0 && !done && <p className="text-xs text-muted">Операций пока нет.</p>}

      {/* Первое подтверждение */}
      <ConfirmDialog
        open={step === 1}
        title="Удалить все операции?"
        danger
        confirmLabel="Продолжить"
        closeOnConfirm={false}
        message={<>Будет удалено <b>{count}</b> {plural(count, 'операция', 'операции', 'операций')}. Это действие необратимо.</>}
        onConfirm={() => setStep(2)}
        onClose={() => setStep(0)}
      />

      {/* Второе подтверждение */}
      <ConfirmDialog
        open={step === 2}
        title="Точно удалить?"
        danger
        confirmLabel="Да, удалить всё"
        cancelLabel="Отмена"
        message="Последнее предупреждение: восстановить операции будет нельзя. Подтвердите удаление."
        onConfirm={finalReset}
        onClose={() => setStep(0)}
      />
    </section>
  );
}

function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

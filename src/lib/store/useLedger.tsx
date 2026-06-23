'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { add, sum, type Minor } from '@/lib/money';

/**
 * Демо-леджер: реальное локальное состояние (localStorage), стартует ПУСТЫМ.
 * Вся арифметика — на целых минорных единицах (копейки), без float.
 * Это «демо-доступ»: данные живут в браузере, без бэкенда.
 */

export type Direction = 'income' | 'expense';

export interface Account {
  id: string;
  name: string;
  currency: string;
  createdAt: number;
}

export interface Tx {
  id: string;
  accountId: string;
  direction: Direction;
  amountMinor: Minor; // всегда положительное; знак задаётся direction
  categoryKey: string;
  occurredAt: string; // YYYY-MM-DD
  note?: string;
  createdAt: number;
}

interface LedgerState {
  accounts: Account[];
  txs: Tx[];
}

interface LedgerContextValue extends LedgerState {
  hydrated: boolean;
  currency: string;
  // действия
  addTx: (input: Omit<Tx, 'id' | 'createdAt'>) => void;
  deleteTx: (id: string) => void;
  addAccount: (name: string, currency?: string) => Account;
  reset: () => void;
  seedSample: () => void;
  // селекторы
  balance: Minor;
  totalIncome: Minor;
  totalExpense: Minor;
  accountBalance: (accountId: string) => Minor;
}

const KEY = 'holdy.ledger.v1';
const DEFAULT_CURRENCY = 'RUB';

const LedgerContext = createContext<LedgerContextValue | null>(null);

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function load(): LedgerState {
  if (typeof window === 'undefined') return { accounts: [], txs: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { accounts: [], txs: [] };
    const parsed = JSON.parse(raw) as LedgerState;
    return { accounts: parsed.accounts ?? [], txs: parsed.txs ?? [] };
  } catch {
    return { accounts: [], txs: [] };
  }
}

export function LedgerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LedgerState>({ accounts: [], txs: [] });
  const [hydrated, setHydrated] = useState(false);

  // Гидратация из localStorage только на клиенте (без mismatch).
  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  // Персист.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* квота/приватный режим — игнорируем */
    }
  }, [state, hydrated]);

  const ensureAccount = useCallback((s: LedgerState): { s: LedgerState; id: string } => {
    if (s.accounts.length > 0) return { s, id: s.accounts[0].id };
    const acc: Account = { id: uid(), name: 'Кошелёк', currency: DEFAULT_CURRENCY, createdAt: Date.now() };
    return { s: { ...s, accounts: [acc] }, id: acc.id };
  }, []);

  const addTx = useCallback<LedgerContextValue['addTx']>((input) => {
    setState((prev) => {
      const { s, id } = ensureAccount(prev);
      const tx: Tx = {
        ...input,
        accountId: input.accountId || id,
        id: uid(),
        createdAt: Date.now(),
      };
      return { ...s, txs: [...s.txs, tx] };
    });
  }, [ensureAccount]);

  const deleteTx = useCallback<LedgerContextValue['deleteTx']>((id) => {
    setState((prev) => ({ ...prev, txs: prev.txs.filter((t) => t.id !== id) }));
  }, []);

  const addAccount = useCallback<LedgerContextValue['addAccount']>((name, currency = DEFAULT_CURRENCY) => {
    const acc: Account = { id: uid(), name, currency, createdAt: Date.now() };
    setState((prev) => ({ ...prev, accounts: [...prev.accounts, acc] }));
    return acc;
  }, []);

  const reset = useCallback(() => setState({ accounts: [], txs: [] }), []);

  const seedSample = useCallback(() => {
    const acc: Account = { id: uid(), name: 'Карта', currency: DEFAULT_CURRENCY, createdAt: Date.now() };
    const today = new Date();
    const d = (offset: number) => {
      const x = new Date(today);
      x.setDate(x.getDate() - offset);
      return x.toISOString().slice(0, 10);
    };
    const txs: Tx[] = [
      { id: uid(), accountId: acc.id, direction: 'income', amountMinor: 12500000, categoryKey: 'salary', occurredAt: d(8), note: 'Зарплата', createdAt: Date.now() },
      { id: uid(), accountId: acc.id, direction: 'expense', amountMinor: 385000, categoryKey: 'groceries', occurredAt: d(6), note: 'Продукты', createdAt: Date.now() },
      { id: uid(), accountId: acc.id, direction: 'expense', amountMinor: 150000, categoryKey: 'cafe', occurredAt: d(4), note: 'Кофейня', createdAt: Date.now() },
      { id: uid(), accountId: acc.id, direction: 'expense', amountMinor: 250000, categoryKey: 'transport', occurredAt: d(3), note: 'Такси', createdAt: Date.now() },
      { id: uid(), accountId: acc.id, direction: 'income', amountMinor: 3500000, categoryKey: 'freelance', occurredAt: d(1), note: 'Подработка', createdAt: Date.now() },
    ];
    setState({ accounts: [acc], txs });
  }, []);

  const value = useMemo<LedgerContextValue>(() => {
    const incomes = state.txs.filter((t) => t.direction === 'income').map((t) => t.amountMinor);
    const expenses = state.txs.filter((t) => t.direction === 'expense').map((t) => t.amountMinor);
    const totalIncome = sum(incomes);
    const totalExpense = sum(expenses);
    const balance = totalIncome - totalExpense;

    const accountBalance = (accountId: string): Minor => {
      let b = 0;
      for (const t of state.txs) {
        if (t.accountId !== accountId) continue;
        b = add(b, t.direction === 'income' ? t.amountMinor : -t.amountMinor);
      }
      return b;
    };

    return {
      ...state,
      hydrated,
      currency: DEFAULT_CURRENCY,
      addTx,
      deleteTx,
      addAccount,
      reset,
      seedSample,
      balance,
      totalIncome,
      totalExpense,
      accountBalance,
    };
  }, [state, hydrated, addTx, deleteTx, addAccount, reset, seedSample]);

  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>;
}

export function useLedger(): LedgerContextValue {
  const ctx = useContext(LedgerContext);
  if (!ctx) throw new Error('useLedger must be used within LedgerProvider');
  return ctx;
}

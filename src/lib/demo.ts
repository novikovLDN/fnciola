/**
 * Демонстрационные данные для кабинета (рендер без живой БД).
 * В проде эти данные приходят из PostgreSQL, отфильтрованные по user_id (§6).
 */

import type { ProjectEntry } from './metrics';

export interface DemoAccount {
  id: string;
  name: string;
  currency: string;
  type: 'cash' | 'card' | 'bank' | 'other';
  balanceMinor: number;
}

export interface DemoTransaction {
  id: string;
  accountId: string;
  direction: 'income' | 'expense';
  amountDisplayMinor: number; // в валюте отображения (RUB)
  currencyOriginal: string;
  amountOriginalMinor: number;
  category: string;
  occurredAt: string;
  description: string;
}

export const DISPLAY_CURRENCY = 'RUB';

export const demoAccounts: DemoAccount[] = [
  { id: 'acc-1', name: 'Карта Тинькофф', currency: 'RUB', type: 'card', balanceMinor: 31250000 },
  { id: 'acc-2', name: 'Наличные', currency: 'RUB', type: 'cash', balanceMinor: 4500000 },
  { id: 'acc-3', name: 'Долларовый счёт', currency: 'USD', type: 'bank', balanceMinor: 12480000 },
];

export const demoTransactions: DemoTransaction[] = [
  { id: 't1', accountId: 'acc-1', direction: 'income', amountDisplayMinor: 12500000, currencyOriginal: 'RUB', amountOriginalMinor: 12500000, category: 'Зарплата', occurredAt: '2026-06-05', description: 'Зарплата за май' },
  { id: 't2', accountId: 'acc-1', direction: 'expense', amountDisplayMinor: -385000, currencyOriginal: 'RUB', amountOriginalMinor: -385000, category: 'Продукты', occurredAt: '2026-06-07', description: 'Пятёрочка' },
  { id: 't3', accountId: 'acc-3', direction: 'expense', amountDisplayMinor: -921500, currencyOriginal: 'USD', amountOriginalMinor: -1000, category: 'Подписки', occurredAt: '2026-06-10', description: 'Облачный хостинг' },
  { id: 't4', accountId: 'acc-1', direction: 'expense', amountDisplayMinor: -150000, currencyOriginal: 'RUB', amountOriginalMinor: -150000, category: 'Кафе', occurredAt: '2026-06-12', description: 'Кофейня' },
  { id: 't5', accountId: 'acc-2', direction: 'expense', amountDisplayMinor: -250000, currencyOriginal: 'RUB', amountOriginalMinor: -250000, category: 'Транспорт', occurredAt: '2026-06-14', description: 'Такси' },
  { id: 't6', accountId: 'acc-1', direction: 'income', amountDisplayMinor: 3500000, currencyOriginal: 'RUB', amountOriginalMinor: 3500000, category: 'Фриланс', occurredAt: '2026-06-18', description: 'Проект на стороне' },
];

/** Демо-проект «Кофейня» с записями для расчёта метрик (§10). */
export const demoProject = {
  id: 'prj-1',
  name: 'Кофейня «На углу»',
  currency: 'RUB',
};

export const demoProjectEntries: ProjectEntry[] = [
  { kind: 'income', amount: 95000000, recurrence: 'monthly', startDate: '2026-01-01' }, // выручка 950k/мес
  { kind: 'expense', expenseGroup: 'cogs', amount: 38000000, recurrence: 'monthly', startDate: '2026-01-01' }, // сырьё/товары
  { kind: 'expense', expenseGroup: 'opex', amount: 15000000, recurrence: 'monthly', startDate: '2026-01-01' }, // аренда
  { kind: 'expense', expenseGroup: 'opex', amount: 20000000, recurrence: 'monthly', startDate: '2026-01-01' }, // зарплаты
  { kind: 'expense', expenseGroup: 'depreciation', amount: 5000000, recurrence: 'monthly', startDate: '2026-01-01' }, // оборудование
  { kind: 'expense', expenseGroup: 'interest', amount: 3000000, recurrence: 'monthly', startDate: '2026-01-01' }, // кредит
  { kind: 'expense', expenseGroup: 'taxes', amount: 6000000, recurrence: 'monthly', startDate: '2026-01-01' }, // налоги
];

export const demoCashBalance = 180000000; // 1.8 млн руб остаток

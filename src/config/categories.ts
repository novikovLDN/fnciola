import type { ComponentType, SVGProps } from 'react';
import {
  IconSalary, IconFreelance, IconGroceries, IconCafe, IconTransport, IconHealth,
  IconSubs, IconFuel, IconShopping, IconUtilities, IconGift, IconOther,
} from '@/components/icons';
import type { Direction } from '@/lib/store/useLedger';

export interface Category {
  key: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  color: string; // hex
  kind: Direction | 'both';
}

export const CATEGORIES: Category[] = [
  { key: 'salary', label: 'Зарплата', icon: IconSalary, color: '#15A35B', kind: 'income' },
  { key: 'freelance', label: 'Подработка', icon: IconFreelance, color: '#0EA5A5', kind: 'income' },
  { key: 'gift', label: 'Подарок', icon: IconGift, color: '#7B8AFF', kind: 'income' },
  { key: 'groceries', label: 'Продукты', icon: IconGroceries, color: '#F24E1E', kind: 'expense' },
  { key: 'cafe', label: 'Кафе', icon: IconCafe, color: '#F4A63A', kind: 'expense' },
  { key: 'transport', label: 'Транспорт', icon: IconTransport, color: '#7B8AFF', kind: 'expense' },
  { key: 'fuel', label: 'Топливо', icon: IconFuel, color: '#9C6BFF', kind: 'expense' },
  { key: 'shopping', label: 'Покупки', icon: IconShopping, color: '#E2407C', kind: 'expense' },
  { key: 'utilities', label: 'ЖКХ', icon: IconUtilities, color: '#3A9BF4', kind: 'expense' },
  { key: 'health', label: 'Здоровье', icon: IconHealth, color: '#E2403C', kind: 'expense' },
  { key: 'subscriptions', label: 'Подписки', icon: IconSubs, color: '#1C1C1E', kind: 'expense' },
  { key: 'other', label: 'Другое', icon: IconOther, color: '#9CA3AF', kind: 'both' },
];

const BY_KEY = new Map(CATEGORIES.map((c) => [c.key, c]));

export function getCategory(key: string): Category {
  return BY_KEY.get(key) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function categoriesFor(direction: Direction): Category[] {
  return CATEGORIES.filter((c) => c.kind === direction || c.kind === 'both');
}

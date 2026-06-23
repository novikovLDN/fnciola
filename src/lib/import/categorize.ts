/**
 * Словарно-правиловая категоризация операций (§9.1, БЕТА).
 *
 * LLM НЕ используется [ЗАФИКСИРОВАНО §9.1] — дорого/приватность.
 * Категоризация по словарю мерчантов и простым правилам. Если не уверены —
 * оставляем без категории (null), пользователь поправит.
 */

export interface CategoryRule {
  /** Ключ системной категории (см. seed категорий). */
  categoryKey: string;
  /** Подстроки/паттерны в описании или мерчанте (нижний регистр). */
  patterns: string[];
}

/** Базовый словарь правил. Расширяется со временем. */
export const DEFAULT_RULES: CategoryRule[] = [
  { categoryKey: 'groceries', patterns: ['пятёрочка', 'пятерочка', 'магнит', 'перекрёсток', 'перекресток', 'ашан', 'лента', 'дикси', 'supermarket', 'grocery'] },
  { categoryKey: 'cafe', patterns: ['кофе', 'coffee', 'starbucks', 'шоколадница', 'ресторан', 'cafe', 'кафе', 'mcdonald', 'kfc', 'бургер'] },
  { categoryKey: 'transport', patterns: ['метро', 'такси', 'taxi', 'uber', 'яндекс.такси', 'yandex go', 'троллейбус', 'автобус', 'metro'] },
  { categoryKey: 'fuel', patterns: ['азс', 'лукойл', 'роснефть', 'газпромнефть', 'shell', 'bp', 'fuel', 'заправка'] },
  { categoryKey: 'utilities', patterns: ['жкх', 'квартплата', 'электроэнергия', 'водоканал', 'газпром межрегионгаз', 'utilities'] },
  { categoryKey: 'telecom', patterns: ['мтс', 'билайн', 'мегафон', 'теле2', 'tele2', 'ростелеком', 'связь', 'интернет'] },
  { categoryKey: 'health', patterns: ['аптека', 'pharmacy', 'клиника', 'медцентр', 'стоматолог', 'больница'] },
  { categoryKey: 'subscriptions', patterns: ['netflix', 'spotify', 'youtube premium', 'подписка', 'apple.com/bill', 'google'] },
  { categoryKey: 'salary', patterns: ['зарплата', 'аванс', 'salary', 'payroll', 'заработная плата'] },
  { categoryKey: 'transfer', patterns: ['перевод', 'p2p', 'transfer', 'пополнение'] },
];

export interface CategorizeInput {
  description: string;
  merchantRaw: string;
}

export interface CategorizeResult {
  categoryKey: string | null;
  /** Уверенность для UI-беты; null-категория = низкая уверенность. */
  confident: boolean;
}

export function categorize(input: CategorizeInput, rules: CategoryRule[] = DEFAULT_RULES): CategorizeResult {
  const haystack = `${input.description} ${input.merchantRaw}`.toLowerCase();
  for (const rule of rules) {
    if (rule.patterns.some((p) => haystack.includes(p))) {
      return { categoryKey: rule.categoryKey, confident: true };
    }
  }
  return { categoryKey: null, confident: false };
}

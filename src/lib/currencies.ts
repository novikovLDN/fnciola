/**
 * Справочник валют и их минорных единиц (ISO 4217).
 *
 * Все денежные суммы в Holdy хранятся в МИНОРНЫХ единицах как целые числа
 * (см. §5.2, §7 ТЗ). Эта таблица задаёт количество знаков после запятой
 * для каждой поддерживаемой валюты, чтобы корректно переводить между
 * мажорными (рубли) и минорными (копейки) представлениями.
 */

export interface CurrencyMeta {
  /** ISO 4217 alpha-3 код */
  code: string;
  /** Русское название */
  name: string;
  /** Символ для отображения */
  symbol: string;
  /** Количество знаков после запятой (минорная единица): RUB=2, JPY=0, BHD=3 */
  decimals: number;
}

export const CURRENCIES: Record<string, CurrencyMeta> = {
  RUB: { code: 'RUB', name: 'Российский рубль', symbol: '₽', decimals: 2 },
  USD: { code: 'USD', name: 'Доллар США', symbol: '$', decimals: 2 },
  EUR: { code: 'EUR', name: 'Евро', symbol: '€', decimals: 2 },
  GBP: { code: 'GBP', name: 'Фунт стерлингов', symbol: '£', decimals: 2 },
  KZT: { code: 'KZT', name: 'Казахстанский тенге', symbol: '₸', decimals: 2 },
  BYN: { code: 'BYN', name: 'Белорусский рубль', symbol: 'Br', decimals: 2 },
  UAH: { code: 'UAH', name: 'Украинская гривна', symbol: '₴', decimals: 2 },
  AMD: { code: 'AMD', name: 'Армянский драм', symbol: '֏', decimals: 2 },
  GEL: { code: 'GEL', name: 'Грузинский лари', symbol: '₾', decimals: 2 },
  TRY: { code: 'TRY', name: 'Турецкая лира', symbol: '₺', decimals: 2 },
  CNY: { code: 'CNY', name: 'Китайский юань', symbol: '¥', decimals: 2 },
  JPY: { code: 'JPY', name: 'Японская иена', symbol: '¥', decimals: 0 },
  AED: { code: 'AED', name: 'Дирхам ОАЭ', symbol: 'د.إ', decimals: 2 },
  CHF: { code: 'CHF', name: 'Швейцарский франк', symbol: 'Fr', decimals: 2 },
};

export const DEFAULT_CURRENCY = 'RUB';

export function getCurrency(code: string): CurrencyMeta {
  const meta = CURRENCIES[code.toUpperCase()];
  if (!meta) {
    // Безопасный дефолт для неизвестных валют — 2 знака (наиболее частый случай).
    return { code: code.toUpperCase(), name: code.toUpperCase(), symbol: code.toUpperCase(), decimals: 2 };
  }
  return meta;
}

export function isSupportedCurrency(code: string): boolean {
  return Boolean(CURRENCIES[code?.toUpperCase()]);
}

export const SUPPORTED_CURRENCY_CODES = Object.keys(CURRENCIES);

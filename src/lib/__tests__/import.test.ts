import { describe, it, expect } from 'vitest';
import { computeExternalHash, partitionDuplicates, normalizeDescription } from '../import/dedup';
import { parseCsv, parseCsvLine, normalizeDate } from '../import/csv';
import { categorize } from '../import/categorize';

describe('import/dedup — дедупликация (§9.2)', () => {
  it('одинаковые операции дают одинаковый external_hash', () => {
    const base = { accountId: 'a1', occurredAt: '2026-06-01', amountOriginal: -15000, currency: 'RUB', normalizedDescription: 'Пятёрочка  Москва' };
    const h1 = computeExternalHash(base);
    const h2 = computeExternalHash({ ...base, normalizedDescription: 'пятёрочка москва' });
    expect(h1).toBe(h2); // нормализация описания
  });

  it('разные суммы дают разные хеши', () => {
    const a = computeExternalHash({ accountId: 'a1', occurredAt: '2026-06-01', amountOriginal: -15000, currency: 'RUB', normalizedDescription: 'x' });
    const b = computeExternalHash({ accountId: 'a1', occurredAt: '2026-06-01', amountOriginal: -15001, currency: 'RUB', normalizedDescription: 'x' });
    expect(a).not.toBe(b);
  });

  it('partitionDuplicates отделяет новые от дублей (включая дубли внутри партии)', () => {
    const rows = [
      { accountId: 'a1', occurredAt: '2026-06-01', amountOriginal: -100, currency: 'RUB', normalizedDescription: 'кофе' },
      { accountId: 'a1', occurredAt: '2026-06-01', amountOriginal: -100, currency: 'RUB', normalizedDescription: 'кофе' }, // дубль в партии
      { accountId: 'a1', occurredAt: '2026-06-02', amountOriginal: -200, currency: 'RUB', normalizedDescription: 'обед' },
    ];
    const existing = new Set([computeExternalHash({ accountId: 'a1', occurredAt: '2026-06-02', amountOriginal: -200, currency: 'RUB', normalizedDescription: 'обед' })]);
    const { unique, duplicates } = partitionDuplicates(rows, existing);
    expect(unique).toHaveLength(1); // только первый «кофе»
    expect(duplicates).toHaveLength(2); // второй «кофе» + «обед» (уже существует)
  });

  it('normalizeDescription схлопывает пробелы и регистр', () => {
    expect(normalizeDescription('  ПРИВЕТ   Мир  ')).toBe('привет мир');
  });
});

describe('import/csv — парсер выписок (§9)', () => {
  it('разбирает строку с кавычками и экранированием', () => {
    expect(parseCsvLine('a,"b,c","d""e"', ',')).toEqual(['a', 'b,c', 'd"e']);
  });

  it('нормализует разные форматы дат', () => {
    expect(normalizeDate('2026-06-01')).toBe('2026-06-01');
    expect(normalizeDate('01.06.2026')).toBe('2026-06-01');
    expect(normalizeDate('01/06/2026')).toBe('2026-06-01');
    expect(normalizeDate('01.06.26')).toBe('2026-06-01');
    expect(normalizeDate('мусор')).toBeNull();
  });

  it('парсит типичную банковскую CSV (одна колонка суммы со знаком)', () => {
    const csv = [
      'Дата;Сумма;Валюта;Описание;Мерчант',
      '01.06.2026;-1500,50;RUB;Покупка продуктов;Пятёрочка',
      '03.06.2026;50000,00;RUB;Зарплата;ООО Ромашка',
    ].join('\n');
    const res = parseCsv(csv, 'RUB');
    expect(res.errors).toHaveLength(0);
    expect(res.rows).toHaveLength(2);
    expect(res.rows[0]).toMatchObject({ occurredAt: '2026-06-01', amountOriginal: -150050, direction: 'expense', currencyOriginal: 'RUB' });
    expect(res.rows[1]).toMatchObject({ direction: 'income', amountOriginal: 5000000 });
  });

  it('парсит раздельные колонки дебет/кредит', () => {
    const csv = [
      'Date,Debit,Credit,Currency,Details',
      '2026-06-01,1500.00,,USD,Coffee shop',
      '2026-06-02,,3000.00,USD,Refund',
    ].join('\n');
    const res = parseCsv(csv, 'USD');
    expect(res.rows[0]).toMatchObject({ direction: 'expense', amountOriginal: -150000 });
    expect(res.rows[1]).toMatchObject({ direction: 'income', amountOriginal: 300000 });
  });

  it('сообщает об ошибке при отсутствии колонки даты', () => {
    const res = parseCsv('Сумма;Описание\n100;тест', 'RUB');
    expect(res.errors.length).toBeGreaterThan(0);
  });

  it('находит таблицу операций после «шапки выписки» банка (Альфа-стиль)', () => {
    const csv = [
      ';;;;',
      'Выписка по счету;;;;',
      'Валюта счета;;RUR;;',
      'Поступления;;;1 006 700,13 RUR;',
      ';;;;',
      'Операции по счету;;;;',
      'Дата операции;Дата проводки;Код;Описание;Сумма в валюте счета;Статус',
      '24.05.2026;24.05.2026;C1;Перевод по СБП;-22 500;Выполнен',
      '25.05.2026;25.05.2026;B0;Внутрибанковский перевод;154 000,50;Выполнен',
      '(подпись сотрудника АО «АЛЬФА-БАНК»);;;;;',
      'Страница 1 из 1;;;;;',
    ].join('\n');
    const res = parseCsv(csv, 'RUB');
    expect(res.errors).toHaveLength(0);
    expect(res.rows).toHaveLength(2);
    // RUR нормализуется в RUB; пробелы-разделители и запятая-десятичная
    expect(res.rows[0]).toMatchObject({ occurredAt: '2026-05-24', direction: 'expense', amountOriginal: -2250000, currencyOriginal: 'RUB' });
    expect(res.rows[1]).toMatchObject({ occurredAt: '2026-05-25', direction: 'income', amountOriginal: 15400050 });
  });
});

describe('import/categorize — словарно-правиловая категоризация (§9.1, beta)', () => {
  it('категоризирует по словарю мерчантов', () => {
    expect(categorize({ description: 'Покупка', merchantRaw: 'Пятёрочка' }).categoryKey).toBe('groceries');
    expect(categorize({ description: 'Яндекс.Такси поездка', merchantRaw: '' }).categoryKey).toBe('transport');
  });

  it('оставляет без категории, если не уверены', () => {
    const r = categorize({ description: 'Нечто непонятное', merchantRaw: 'XYZ123' });
    expect(r.categoryKey).toBeNull();
    expect(r.confident).toBe(false);
  });
});

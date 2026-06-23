/**
 * Словарь локали ru (§17 ТЗ). i18n с первого дня — ключи вместо хардкода строк.
 * На MVP только русский; структура позволяет добавить локали позже.
 */

export const ru = {
  brand: 'Holdy',
  nav: {
    dashboard: 'Дашборд',
    transactions: 'Операции',
    accounts: 'Счета',
    categories: 'Категории',
    import: 'Импорт',
    projects: 'Мой проект',
    settings: 'Настройки',
    login: 'Войти',
    start: 'Начать',
    logout: 'Выйти',
  },
  metrics: {
    revenue: 'Выручка',
    grossProfit: 'Валовая прибыль',
    grossMargin: 'Валовая маржа',
    ebit: 'Операционная прибыль (EBIT)',
    ebitda: 'EBITDA',
    netProfit: 'Чистая прибыль',
    netMargin: 'Чистая маржа',
    cashFlow: 'Денежный поток',
    burnRate: 'Burn rate',
    runway: 'Runway',
    cogs: 'Себестоимость (COGS)',
    opex: 'Операционные (OPEX)',
    taxes: 'Налоги',
    interest: 'Проценты',
    depreciation: 'Амортизация',
  },
  common: {
    income: 'Доход',
    expense: 'Расход',
    balance: 'Баланс',
    period: 'Период',
    noData: '—',
    months: 'мес.',
    beta: 'бета',
    disclaimer:
      'Управленческая оценка, не бухгалтерская/аудиторская отчётность.',
  },
} as const;

export type Dictionary = typeof ru;
export const dict = ru;

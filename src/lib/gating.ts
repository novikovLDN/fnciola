/**
 * Инфраструктура гейтинга Free/Pro (§3 ТЗ).
 *
 * ВАЖНО: на MVP весь функционал бесплатный [ЗАФИКСИРОВАНО]. Но проверки прав
 * проходят через единый механизм `canUse(feature, user)`, чтобы включить
 * пейволл позже без правки бизнес-логики. Распределение фич по тарифам
 * НЕ хардкодим в компонентах — только здесь, в конфиге.
 */

export type Feature =
  | 'import_bank_statement'
  | 'multicurrency'
  | 'business_module'
  | 'advanced_charts'
  | 'export';

export type Tier = 'free' | 'pro';

export interface FeatureConfig {
  /** Минимальный тариф, требуемый для фичи. */
  minTier: Tier;
  /** Глобальный флаг включения фичи (kill-switch). */
  enabled: boolean;
}

/**
 * Конфиг фич. На MVP все доступны на тарифе `free` (весь функционал бесплатный).
 * Когда введём пейволл — поменяем `minTier` на `pro` для нужных фич ЗДЕСЬ,
 * без изменения вызовов `canUse` в коде.
 */
export const FEATURE_CONFIG: Record<Feature, FeatureConfig> = {
  import_bank_statement: { minTier: 'free', enabled: true },
  multicurrency: { minTier: 'free', enabled: true },
  business_module: { minTier: 'free', enabled: true },
  advanced_charts: { minTier: 'free', enabled: true },
  export: { minTier: 'free', enabled: true },
};

const TIER_RANK: Record<Tier, number> = { free: 0, pro: 1 };

export interface GatingUser {
  subscriptionTier: Tier;
  subscriptionStatus?: string | null;
}

/**
 * Единая функция проверки доступа к фиче.
 * Возвращает true, если фича включена и тариф пользователя достаточен.
 */
export function canUse(feature: Feature, user: GatingUser): boolean {
  const cfg = FEATURE_CONFIG[feature];
  if (!cfg || !cfg.enabled) return false;
  return TIER_RANK[user.subscriptionTier] >= TIER_RANK[cfg.minTier];
}

/** Хелпер для серверных роутов: бросает, если доступа нет. */
export class FeatureLockedError extends Error {
  constructor(public readonly feature: Feature) {
    super(`Функция «${feature}» недоступна на текущем тарифе`);
    this.name = 'FeatureLockedError';
  }
}

export function assertCanUse(feature: Feature, user: GatingUser): void {
  if (!canUse(feature, user)) {
    throw new FeatureLockedError(feature);
  }
}

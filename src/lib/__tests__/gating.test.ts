import { describe, it, expect } from 'vitest';
import { canUse, assertCanUse, FeatureLockedError, FEATURE_CONFIG } from '../gating';

describe('gating — инфраструктура Free/Pro (§3)', () => {
  it('на MVP все фичи доступны на тарифе free', () => {
    const freeUser = { subscriptionTier: 'free' as const };
    expect(canUse('import_bank_statement', freeUser)).toBe(true);
    expect(canUse('multicurrency', freeUser)).toBe(true);
    expect(canUse('business_module', freeUser)).toBe(true);
    expect(canUse('advanced_charts', freeUser)).toBe(true);
    expect(canUse('export', freeUser)).toBe(true);
  });

  it('kill-switch отключает фичу независимо от тарифа', () => {
    const original = FEATURE_CONFIG.export.enabled;
    FEATURE_CONFIG.export.enabled = false;
    expect(canUse('export', { subscriptionTier: 'pro' })).toBe(false);
    FEATURE_CONFIG.export.enabled = original;
  });

  it('pro-фича (если поднять minTier) недоступна free, доступна pro', () => {
    const original = FEATURE_CONFIG.advanced_charts.minTier;
    FEATURE_CONFIG.advanced_charts.minTier = 'pro';
    expect(canUse('advanced_charts', { subscriptionTier: 'free' })).toBe(false);
    expect(canUse('advanced_charts', { subscriptionTier: 'pro' })).toBe(true);
    FEATURE_CONFIG.advanced_charts.minTier = original;
  });

  it('assertCanUse бросает FeatureLockedError при отказе', () => {
    const original = FEATURE_CONFIG.business_module.minTier;
    FEATURE_CONFIG.business_module.minTier = 'pro';
    expect(() => assertCanUse('business_module', { subscriptionTier: 'free' })).toThrow(FeatureLockedError);
    FEATURE_CONFIG.business_module.minTier = original;
  });
});

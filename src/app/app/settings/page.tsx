'use client';

import { useEffect, useState } from 'react';
import { Item, PageHeader } from '@/components/cabinet/ui';
import { Select } from '@/components/ui/Select';
import { SUPPORTED_CURRENCY_CODES, getCurrency } from '@/lib/currencies';
import { PLANS, pricePerMonthMinor, CURRENCY_PLANS } from '@/config/plans';
import { formatMoney } from '@/lib/money';
import { NotificationsCard } from './NotificationsCard';
import { LogoutButton } from '@/components/cabinet/LogoutButton';
import { IconKey } from '@/components/icons';

/** Настройки (§15.2): профиль, валюта, passkeys, пароль, уведомления, подписка. */
export default function SettingsPage() {
  const [currency, setCurrency] = useState('RUB');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((j) => {
      if (j.user?.email) setEmail(j.user.email);
      if (j.user?.displayCurrency) setCurrency(j.user.displayCurrency);
    }).catch(() => {});
  }, []);
  const currencyOptions = SUPPORTED_CURRENCY_CODES.map((code) => {
    const c = getCurrency(code);
    return { value: code, label: `${c.code} — ${c.name}`, hint: c.symbol };
  });

  return (
    <div className="space-y-4">
      <PageHeader title="Настройки" />

      <Item>
        <section className="card space-y-4">
          <h2 className="font-display text-lg font-semibold">Профиль</h2>
          <label className="block max-w-sm">
            <span className="text-sm text-muted">Email</span>
            <input className="mt-1.5 w-full rounded-2xl border border-ink/10 bg-bg-2 px-4 py-2.5 text-sm outline-none" value={email || '—'} readOnly />
          </label>
          <div className="block max-w-sm">
            <span className="text-sm text-muted">Валюта отображения</span>
            <Select className="mt-1.5" value={currency} onChange={setCurrency} options={currencyOptions} ariaLabel="Валюта отображения" />
          </div>
        </section>
      </Item>

      <Item>
        <section className="card space-y-3">
          <h2 className="font-display text-lg font-semibold">Безопасность</h2>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-medium">Passkey (Face ID / Touch ID)</div>
              <div className="text-sm text-muted">Вход без пароля по WebAuthn (§11.2).</div>
            </div>
            <button className="btn btn-secondary"><IconKey size={16} /> Привязать passkey</button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink/8 pt-3">
            <div>
              <div className="font-medium">Пароль</div>
              <div className="text-sm text-muted">Минимум 8 символов.</div>
            </div>
            <button className="btn btn-ghost">Сменить пароль</button>
          </div>
        </section>
      </Item>

      <Item><NotificationsCard /></Item>

      <Item>
        <section className="card space-y-4">
          <h2 className="font-display text-lg font-semibold">Подписка</h2>
          <span className="badge bg-positive/15 text-positive">Текущий план: Free — всё включено на MVP</span>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {PLANS.map((p) => (
              <div key={p.id} className={`flex flex-col rounded-3xl border p-4 ${p.popular ? 'border-accent/40 ring-gradient' : 'border-ink/10'}`}>
                <div className="text-sm font-medium">{p.title}</div>
                <div className="metric-value mt-1 text-xl">{formatMoney(p.priceMinor, CURRENCY_PLANS)}</div>
                <div className="text-xs text-muted">{formatMoney(pricePerMonthMinor(p), CURRENCY_PLANS)}/мес</div>
                <button className="btn btn-primary mt-3 w-full text-sm">Оформить</button>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted">
            Оплата через Platecha. Автопродление, отмена в любой момент — доступ до конца оплаченного периода (§12).
          </p>
        </section>
      </Item>

      <Item>
        <LogoutButton className="btn btn-secondary w-full" />
      </Item>
    </div>
  );
}

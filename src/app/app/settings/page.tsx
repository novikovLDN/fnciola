import { SUPPORTED_CURRENCY_CODES, getCurrency } from '@/lib/currencies';
import { PLANS, pricePerMonthMinor, CURRENCY_PLANS } from '@/config/plans';
import { Money } from '@/components/cabinet/Money';
import { NotificationsCard } from './NotificationsCard';

/** Настройки (§15.2): профиль, валюта, passkeys, пароль, уведомления, подписка. */
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl sm:text-3xl">Настройки</h1>

      <section className="bento space-y-4">
        <h2 className="font-display text-lg">Профиль</h2>
        <label className="block max-w-sm">
          <span className="text-sm text-ink/70">Email</span>
          <input className="mt-1 w-full rounded-pill border border-black/10 bg-bg px-4 py-2.5 text-sm" defaultValue="user@example.com" readOnly />
        </label>
        <label className="block max-w-sm">
          <span className="text-sm text-ink/70">Валюта отображения (§8)</span>
          <select className="mt-1 w-full rounded-pill border border-black/10 bg-bg px-4 py-2.5 text-sm" defaultValue="RUB">
            {SUPPORTED_CURRENCY_CODES.map((code) => {
              const c = getCurrency(code);
              return <option key={code} value={code}>{c.code} — {c.name}</option>;
            })}
          </select>
        </label>
      </section>

      <section className="bento space-y-3">
        <h2 className="font-display text-lg">Безопасность</h2>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="font-medium">Passkey (Face ID / Touch ID)</div>
            <div className="text-sm text-ink/60">Вход без пароля по WebAuthn (§11.2).</div>
          </div>
          <button className="btn-soft">Привязать passkey</button>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-2 border-t border-black/5 pt-3">
          <div>
            <div className="font-medium">Пароль</div>
            <div className="text-sm text-ink/60">Минимум 8 символов.</div>
          </div>
          <button className="btn-ghost">Сменить пароль</button>
        </div>
      </section>

      <NotificationsCard />

      <section className="bento space-y-4">
        <h2 className="font-display text-lg">Подписка</h2>
        <div className="flex items-center gap-2">
          <span className="badge bg-positive/15 text-positive">Текущий план: Free (всё включено на MVP)</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {PLANS.map((p) => (
            <div key={p.id} className={`rounded-bento border p-4 ${p.popular ? 'border-accent' : 'border-black/10'}`}>
              <div className="text-sm font-medium">{p.title}</div>
              <div className="metric-value text-xl mt-1"><Money amount={p.priceMinor} currency={CURRENCY_PLANS} /></div>
              <div className="text-xs text-ink/50">{(pricePerMonthMinor(p) / 100).toFixed(0)} ₽/мес</div>
              <button className="btn-primary w-full mt-3 text-sm">Оформить</button>
            </div>
          ))}
        </div>
        <p className="text-xs text-ink/40">
          Оплата через Platecha. Автопродление, отмена в любой момент (доступ — до конца оплаченного периода) (§12).
        </p>
      </section>
    </div>
  );
}

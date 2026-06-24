'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Field } from '@/components/auth/Field';
import { IconKey } from '@/components/icons';

/** Вход: email + пароль или passkey. */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pkBusy, setPkBusy] = useState(false);

  async function passkeyLogin() {
    setError('');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError('Введите email для входа по passkey');
    setPkBusy(true);
    try {
      const { startAuthentication } = await import('@simplewebauthn/browser');
      const optRes = await fetch('/api/auth/passkey/login/options', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
      });
      const options = await optRes.json();
      if (!optRes.ok) { setError(options.error || 'Для этого email нет passkey'); return; }
      const asseResp = await startAuthentication({ optionsJSON: options });
      const verifyRes = await fetch('/api/auth/passkey/login/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(asseResp),
      });
      const json = await verifyRes.json().catch(() => ({}));
      if (!verifyRes.ok) { setError(json.error || 'Не удалось войти по passkey'); return; }
      router.push('/app');
      router.refresh();
    } catch (e) {
      const name = (e as { name?: string }).name;
      setError(name === 'NotAllowedError' ? 'Вход по passkey отменён' : 'Не удалось войти по passkey');
    } finally {
      setPkBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError('Введите корректный email');
    if (pwd.length < 1) return setError('Введите пароль');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pwd }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || 'Не удалось войти');
        return;
      }
      router.push('/app');
      router.refresh();
    } catch {
      setError('Ошибка сети. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card ring-gradient">
      <h1 className="font-display text-2xl font-bold">Вход в Holdy</h1>
      <p className="mt-1 text-sm text-muted">Рады видеть снова</p>

      <button type="button" onClick={passkeyLogin} disabled={pkBusy} className="btn btn-secondary mt-6 w-full disabled:opacity-60">
        <IconKey size={18} /> {pkBusy ? 'Ожидание…' : 'Войти по passkey'}
      </button>
      <div className="my-4 flex items-center gap-3 text-xs text-muted">
        <div className="h-px flex-1 bg-ink/10" /> или по паролю <div className="h-px flex-1 bg-ink/10" />
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
        <Field label="Пароль" type="password" value={pwd} onChange={setPwd} autoComplete="current-password" />
        <div className="flex justify-between">
          {error ? <span className="text-sm text-negative">{error}</span> : <span />}
          <Link href="/recovery" className="text-sm text-accent hover:underline">Забыли пароль?</Link>
        </div>
        <button className="btn btn-primary w-full" disabled={loading}>{loading ? 'Входим…' : 'Войти'}</button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Нет аккаунта? <Link href="/register" className="font-medium text-accent hover:underline">Создать</Link>
      </p>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { checkPasswordStrength } from '@/lib/password';
import { Field } from '@/components/auth/Field';
import { ResendCode } from '@/components/auth/ResendCode';

type Step = 'email' | 'code' | 'password';

/** Восстановление пароля: email → OTP-код → новый пароль (обновляется в БД). */
export default function RecoveryPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const strength = checkPasswordStrength(pwd);

  async function post(url: string, body: object) {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, json } as { ok: boolean; json: { error?: string; devCode?: string } };
  }

  async function resend(): Promise<number> {
    setError('');
    setInfo('');
    const { ok, json } = await post('/api/auth/recovery/start', { email });
    if (ok) {
      if (json.devCode) setInfo(`Тестовый код: ${json.devCode}`);
      return 60;
    }
    const retry = (json as { retryAfter?: number }).retryAfter;
    if (retry) return retry;
    setError(json.error || 'Не удалось отправить код');
    return 60;
  }

  async function next(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      if (step === 'email') {
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError('Введите корректный email');
        const { ok, json } = await post('/api/auth/recovery/start', { email });
        if (!ok) return setError(json.error || 'Не удалось отправить код');
        if (json.devCode) setInfo(`Тестовый код: ${json.devCode}`);
        setStep('code');
      } else if (step === 'code') {
        if (!/^\d{6}$/.test(code)) return setError('Код состоит из 6 цифр');
        const { ok, json } = await post('/api/auth/recovery/verify', { email, code });
        if (!ok) return setError(json.error || 'Неверный код');
        setStep('password');
      } else {
        if (!strength.valid) return setError('Пароль слишком короткий (минимум 8 символов)');
        const { ok, json } = await post('/api/auth/recovery/set-password', { email, code, password: pwd });
        if (!ok) return setError(json.error || 'Не удалось обновить пароль');
        router.push('/app');
        router.refresh();
      }
    } catch {
      setError('Ошибка сети. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card ring-gradient">
      <h1 className="font-display text-2xl font-bold">Восстановление</h1>
      <p className="mt-1 text-sm text-muted">
        {step === 'email' ? 'Сбросьте пароль по коду из письма' : step === 'code' ? `Код отправлен на ${email}` : 'Придумайте новый пароль'}
      </p>

      <form onSubmit={next} className="mt-6 space-y-4">
        {step === 'email' && <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />}
        {step === 'code' && (
          <>
            <Field label="Код из письма" inputMode="numeric" value={code} onChange={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))} placeholder="000000" />
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setStep('email')} className="text-xs text-muted hover:text-ink">Изменить email</button>
              <ResendCode onResend={resend} />
            </div>
          </>
        )}
        {step === 'password' && (
          <>
            <Field label="Новый пароль" type="password" value={pwd} onChange={setPwd} autoComplete="new-password" />
            {pwd && <p className="text-xs text-muted">Надёжность: {strength.label}</p>}
          </>
        )}
        {info && <p className="text-sm text-accent" role="status">{info}</p>}
        {error && <p className="text-sm text-negative" role="alert">{error}</p>}
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Подождите…' : step === 'email' ? 'Отправить код' : step === 'code' ? 'Подтвердить' : 'Сохранить пароль'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Вспомнили? <Link href="/login" className="font-medium text-accent hover:underline">Войти</Link>
      </p>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { checkPasswordStrength } from '@/lib/password';
import { Field } from '@/components/auth/Field';
import { ResendCode } from '@/components/auth/ResendCode';

type Step = 'email' | 'code' | 'password';

/** Регистрация: email → OTP-код (Resend) → пароль. Аккаунт сохраняется в БД. */
export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const strength = checkPasswordStrength(pwd);
  const stepNo = step === 'email' ? 1 : step === 'code' ? 2 : 3;

  async function post(url: string, body: object) {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, json } as { ok: boolean; json: { error?: string; devCode?: string } };
  }

  // Повторная отправка кода. Возвращает число секунд до следующей попытки.
  async function resend(): Promise<number> {
    setError('');
    setInfo('');
    const { ok, json } = await post('/api/auth/register/start', { email });
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
        const { ok, json } = await post('/api/auth/register/start', { email });
        if (!ok) return setError(json.error || 'Не удалось отправить код');
        if (json.devCode) setInfo(`Тестовый код: ${json.devCode}`);
        setStep('code');
      } else if (step === 'code') {
        if (!/^\d{6}$/.test(code)) return setError('Код состоит из 6 цифр');
        const { ok, json } = await post('/api/auth/register/verify', { email, code });
        if (!ok) return setError(json.error || 'Неверный код');
        setStep('password');
      } else {
        if (!strength.valid) return setError('Пароль слишком короткий (минимум 8 символов)');
        if (pwd !== pwd2) return setError('Пароли не совпадают');
        const { ok, json } = await post('/api/auth/register/set-password', { email, code, password: pwd });
        if (!ok) return setError(json.error || 'Не удалось создать аккаунт');
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
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Создать аккаунт</h1>
        <span className="text-sm text-muted">{stepNo} / 3</span>
      </div>
      <div className="mb-6 flex gap-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-ink/10">
            <motion.div className="h-full bg-grad-brand" initial={false} animate={{ width: stepNo >= i ? '100%' : '0%' }} transition={{ duration: 0.4 }} />
          </div>
        ))}
      </div>

      <form onSubmit={next} className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }} className="space-y-4">
            {step === 'email' && <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoFocus autoComplete="email" />}
            {step === 'code' && (
              <>
                <p className="text-sm text-muted">Мы отправили 6-значный код на {email}.</p>
                <Field label="Код из письма" inputMode="numeric" value={code} onChange={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))} placeholder="000000" autoFocus />
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => setStep('email')} className="text-xs text-muted hover:text-ink">Изменить email</button>
                  <ResendCode onResend={resend} />
                </div>
              </>
            )}
            {step === 'password' && (
              <>
                <Field label="Пароль" type="password" value={pwd} onChange={setPwd} autoFocus autoComplete="new-password" />
                {pwd && (
                  <div className="text-xs">
                    <div className="h-1.5 overflow-hidden rounded-full bg-ink/10">
                      <div className="h-full bg-grad-brand transition-all" style={{ width: `${(strength.score / 4) * 100}%` }} />
                    </div>
                    <p className="mt-1 text-muted">Надёжность: {strength.label}{strength.issues.length ? ` · ${strength.issues.join(', ')}` : ''}</p>
                  </div>
                )}
                <Field label="Повторите пароль" type="password" value={pwd2} onChange={setPwd2} autoComplete="new-password" />
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {info && <p className="text-sm text-accent" role="status">{info}</p>}
        {error && <p className="text-sm text-negative" role="alert">{error}</p>}
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Подождите…' : step === 'password' ? 'Создать аккаунт' : 'Продолжить →'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Уже есть аккаунт? <Link href="/login" className="font-medium text-accent hover:underline">Войти</Link>
      </p>
    </div>
  );
}

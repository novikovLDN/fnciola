'use client';

import { useState } from 'react';
import Link from 'next/link';
import { checkPasswordStrength } from '@/lib/password';

type Step = 'email' | 'code' | 'password';

/** Регистрация (§11.1): email → OTP-код → пароль ×2. */
export default function RegisterPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [error, setError] = useState('');

  const strength = checkPasswordStrength(pwd);

  function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Введите корректный email');
      return;
    }
    // POST /auth/register/start → отправка OTP на email
    setStep('code');
  }

  function submitCode(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(code)) {
      setError('Код состоит из 6 цифр');
      return;
    }
    // POST /auth/register/verify
    setStep('password');
  }

  function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!strength.valid) {
      setError('Пароль слишком короткий (минимум 8 символов)');
      return;
    }
    if (pwd !== pwd2) {
      setError('Пароли не совпадают');
      return;
    }
    // POST /auth/register/set-password → готово
    alert('Демо: регистрация завершена. В проде — переход в кабинет.');
  }

  return (
    <div className="bento">
      <h1 className="font-display text-2xl mb-1">Создать аккаунт</h1>
      <p className="text-sm text-ink/60 mb-6">Шаг {step === 'email' ? 1 : step === 'code' ? 2 : 3} из 3</p>

      {step === 'email' && (
        <form onSubmit={submitEmail} className="space-y-4">
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoFocus />
          <button className="btn-accent w-full">Получить код</button>
        </form>
      )}

      {step === 'code' && (
        <form onSubmit={submitCode} className="space-y-4">
          <p className="text-sm text-ink/60">Мы отправили 6-значный код на {email}.</p>
          <Field label="Код из письма" inputMode="numeric" value={code} onChange={setCode} placeholder="000000" autoFocus />
          <button className="btn-accent w-full">Подтвердить</button>
          <button type="button" className="btn-ghost w-full text-sm" onClick={() => setStep('email')}>Изменить email</button>
        </form>
      )}

      {step === 'password' && (
        <form onSubmit={submitPassword} className="space-y-4">
          <Field label="Пароль" type="password" value={pwd} onChange={setPwd} autoFocus />
          {pwd && (
            <div className="text-xs">
              <div className="h-1.5 rounded-pill bg-black/10 overflow-hidden">
                <div className="h-full bg-accent transition-all" style={{ width: `${(strength.score / 4) * 100}%` }} />
              </div>
              <p className="mt-1 text-ink/60">Надёжность: {strength.label}{strength.issues.length ? ` · ${strength.issues.join(', ')}` : ''}</p>
            </div>
          )}
          <Field label="Повторите пароль" type="password" value={pwd2} onChange={setPwd2} />
          <button className="btn-accent w-full">Завершить регистрацию</button>
        </form>
      )}

      {error && <p className="text-sm text-negative mt-4" role="alert">{error}</p>}

      <p className="text-sm text-ink/60 mt-6 text-center">
        Уже есть аккаунт? <Link href="/login" className="text-accent font-medium">Войти</Link>
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>) {
  return (
    <label className="block">
      <span className="text-sm text-ink/70">{label}</span>
      <input
        {...rest}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-pill border border-black/10 bg-bg px-4 py-2.5 text-sm"
      />
    </label>
  );
}

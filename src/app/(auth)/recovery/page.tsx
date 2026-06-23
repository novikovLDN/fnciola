'use client';

import { useState } from 'react';
import Link from 'next/link';
import { checkPasswordStrength } from '@/lib/password';
import { Field } from '@/components/auth/Field';

type Step = 'email' | 'code' | 'password';

/** Восстановление пароля (§11.3): email → OTP-код → новый пароль. */
export default function RecoveryPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [pwd, setPwd] = useState('');
  const strength = checkPasswordStrength(pwd);

  return (
    <div className="card ring-gradient">
      <h1 className="font-display text-2xl font-bold">Восстановление</h1>
      <p className="mt-1 text-sm text-muted">Сбросьте пароль по коду из письма</p>

      {step === 'email' && (
        <form onSubmit={(e) => { e.preventDefault(); setStep('code'); }} className="mt-6 space-y-4">
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
          <button className="btn btn-primary w-full">Отправить код</button>
        </form>
      )}
      {step === 'code' && (
        <form onSubmit={(e) => { e.preventDefault(); setStep('password'); }} className="mt-6 space-y-4">
          <Field label="Код из письма" inputMode="numeric" value={code} onChange={setCode} placeholder="000000" />
          <button className="btn btn-primary w-full">Подтвердить</button>
        </form>
      )}
      {step === 'password' && (
        <form onSubmit={(e) => { e.preventDefault(); alert('Демо: пароль обновлён.'); }} className="mt-6 space-y-4">
          <Field label="Новый пароль" type="password" value={pwd} onChange={setPwd} />
          {pwd && <p className="text-xs text-muted">Надёжность: {strength.label}</p>}
          <button className="btn btn-primary w-full" disabled={!strength.valid}>Сохранить пароль</button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        Вспомнили? <Link href="/login" className="font-medium text-cyan hover:underline">Войти</Link>
      </p>
    </div>
  );
}

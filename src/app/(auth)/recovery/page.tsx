'use client';

import { useState } from 'react';
import Link from 'next/link';
import { checkPasswordStrength } from '@/lib/password';

type Step = 'email' | 'code' | 'password';

/** Восстановление пароля (§11.3): email → OTP-код → новый пароль. */
export default function RecoveryPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [pwd, setPwd] = useState('');
  const strength = checkPasswordStrength(pwd);

  return (
    <div className="bento">
      <h1 className="font-display text-2xl mb-1">Восстановление доступа</h1>
      <p className="text-sm text-ink/60 mb-6">Сбросьте пароль по коду из письма.</p>

      {step === 'email' && (
        <form onSubmit={(e) => { e.preventDefault(); setStep('code'); }} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
          <button className="btn-accent w-full">Отправить код</button>
        </form>
      )}
      {step === 'code' && (
        <form onSubmit={(e) => { e.preventDefault(); setStep('password'); }} className="space-y-4">
          <Input label="Код из письма" inputMode="numeric" value={code} onChange={setCode} placeholder="000000" />
          <button className="btn-accent w-full">Подтвердить</button>
        </form>
      )}
      {step === 'password' && (
        <form onSubmit={(e) => { e.preventDefault(); alert('Демо: пароль обновлён.'); }} className="space-y-4">
          <Input label="Новый пароль" type="password" value={pwd} onChange={setPwd} />
          {pwd && <p className="text-xs text-ink/60">Надёжность: {strength.label}</p>}
          <button className="btn-accent w-full" disabled={!strength.valid}>Сохранить пароль</button>
        </form>
      )}

      <p className="text-sm text-ink/60 mt-6 text-center">
        Вспомнили? <Link href="/login" className="text-accent font-medium">Войти</Link>
      </p>
    </div>
  );
}

function Input({
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
      <input {...rest} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-pill border border-black/10 bg-bg px-4 py-2.5 text-sm" />
    </label>
  );
}

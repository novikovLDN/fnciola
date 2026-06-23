'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { checkPasswordStrength } from '@/lib/password';
import { Field } from '@/components/auth/Field';

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
  const stepNo = step === 'email' ? 1 : step === 'code' ? 2 : 3;

  function next(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (step === 'email') {
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError('Введите корректный email');
      return setStep('code');
    }
    if (step === 'code') {
      if (!/^\d{6}$/.test(code)) return setError('Код состоит из 6 цифр');
      return setStep('password');
    }
    if (!strength.valid) return setError('Пароль слишком короткий (минимум 8 символов)');
    if (pwd !== pwd2) return setError('Пароли не совпадают');
    alert('Демо: регистрация завершена.');
  }

  return (
    <div className="card ring-gradient">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Создать аккаунт</h1>
        <span className="text-sm text-muted">{stepNo} / 3</span>
      </div>
      {/* Прогресс */}
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
            {step === 'email' && <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoFocus />}
            {step === 'code' && (
              <>
                <p className="text-sm text-muted">Мы отправили 6-значный код на {email}.</p>
                <Field label="Код из письма" inputMode="numeric" value={code} onChange={setCode} placeholder="000000" autoFocus />
              </>
            )}
            {step === 'password' && (
              <>
                <Field label="Пароль" type="password" value={pwd} onChange={setPwd} autoFocus />
                {pwd && (
                  <div className="text-xs">
                    <div className="h-1.5 overflow-hidden rounded-full bg-ink/10">
                      <div className="h-full bg-grad-brand transition-all" style={{ width: `${(strength.score / 4) * 100}%` }} />
                    </div>
                    <p className="mt-1 text-muted">Надёжность: {strength.label}{strength.issues.length ? ` · ${strength.issues.join(', ')}` : ''}</p>
                  </div>
                )}
                <Field label="Повторите пароль" type="password" value={pwd2} onChange={setPwd2} />
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {error && <p className="text-sm text-negative" role="alert">{error}</p>}
        <button className="btn btn-primary w-full">{step === 'password' ? 'Завершить регистрацию' : 'Продолжить →'}</button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Уже есть аккаунт? <Link href="/login" className="font-medium text-cyan hover:underline">Войти</Link>
      </p>
    </div>
  );
}

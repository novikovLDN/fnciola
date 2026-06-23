'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Field } from '@/components/auth/Field';

/** Вход (§11.2): email + пароль ИЛИ passkey (WebAuthn). */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    alert('Демо: вход по паролю.');
  }
  async function passkeyLogin() {
    if (!('credentials' in navigator)) return alert('Браузер не поддерживает passkey');
    alert('Демо: вход по passkey (WebAuthn / Face ID / Touch ID).');
  }

  return (
    <div className="card ring-gradient">
      <h1 className="font-display text-2xl font-bold">Вход в Holdy</h1>
      <p className="mt-1 text-sm text-muted">Рады видеть снова</p>

      <button onClick={passkeyLogin} className="btn btn-primary mt-6 w-full">🔑 Войти по passkey</button>

      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <div className="h-px flex-1 bg-white/10" /> или по паролю <div className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        <Field label="Пароль" type="password" value={pwd} onChange={setPwd} />
        <div className="flex justify-end">
          <Link href="/recovery" className="text-sm text-cyan hover:underline">Забыли пароль?</Link>
        </div>
        <button className="btn btn-glass w-full">Войти</button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Нет аккаунта? <Link href="/register" className="font-medium text-cyan hover:underline">Создать</Link>
      </p>
    </div>
  );
}

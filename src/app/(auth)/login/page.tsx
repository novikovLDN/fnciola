'use client';

import { useState } from 'react';
import Link from 'next/link';

/** Вход (§11.2): email + пароль ИЛИ passkey (WebAuthn). */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // POST /auth/login/password
    alert('Демо: вход по паролю. В проде — сессия + переход в кабинет.');
  }

  async function passkeyLogin() {
    // POST /auth/login/passkey/challenge → navigator.credentials.get → verify
    if (!('credentials' in navigator)) {
      alert('Браузер не поддерживает passkey');
      return;
    }
    alert('Демо: вход по passkey (WebAuthn / Face ID / Touch ID).');
  }

  return (
    <div className="bento">
      <h1 className="font-display text-2xl mb-6">Вход в Holdy</h1>

      <button onClick={passkeyLogin} className="btn-primary w-full mb-4">
        🔑 Войти по passkey (Face ID / Touch ID)
      </button>

      <div className="flex items-center gap-3 my-4 text-xs text-ink/40">
        <div className="h-px bg-black/10 flex-1" /> или по паролю <div className="h-px bg-black/10 flex-1" />
      </div>

      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="text-sm text-ink/70">Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-pill border border-black/10 bg-bg px-4 py-2.5 text-sm" placeholder="you@example.com" />
        </label>
        <label className="block">
          <span className="text-sm text-ink/70">Пароль</span>
          <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="mt-1 w-full rounded-pill border border-black/10 bg-bg px-4 py-2.5 text-sm" />
        </label>
        <div className="flex justify-end">
          <Link href="/recovery" className="text-sm text-accent">Забыли пароль?</Link>
        </div>
        <button className="btn-accent w-full">Войти</button>
      </form>

      <p className="text-sm text-ink/60 mt-6 text-center">
        Нет аккаунта? <Link href="/register" className="text-accent font-medium">Создать</Link>
      </p>
    </div>
  );
}

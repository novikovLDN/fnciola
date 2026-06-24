'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IconLogout } from '@/components/icons';

/** Выход: завершает сессию на сервере и уводит на главную. */
export function LogoutButton({ className = '', label = 'Выйти' }: { className?: string; label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      /* всё равно уходим */
    }
    router.push('/');
    router.refresh();
  }
  return (
    <button onClick={logout} disabled={busy} className={className}>
      <IconLogout size={18} /> {label}
    </button>
  );
}

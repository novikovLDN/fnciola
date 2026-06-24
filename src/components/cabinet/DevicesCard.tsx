'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { relativeTime } from '@/lib/relative-time';
import { IconTrash } from '@/components/icons';

interface SessionRow {
  id: string;
  deviceLabel: string | null;
  ip: string | null;
  lastSeenAt: string;
  current: boolean;
}

export function DevicesCard() {
  const router = useRouter();
  const [rows, setRows] = useState<SessionRow[] | null>(null);
  const [pending, setPending] = useState<SessionRow | null>(null);

  async function load() {
    try {
      const res = await fetch('/api/auth/sessions', { cache: 'no-store' });
      const json = await res.json();
      setRows(json.sessions ?? []);
    } catch {
      setRows([]);
    }
  }
  useEffect(() => { load(); }, []);

  async function revoke(row: SessionRow) {
    const res = await fetch(`/api/auth/sessions/${row.id}`, { method: 'DELETE' });
    const json = await res.json().catch(() => ({}));
    if (json.wasCurrent) {
      router.push('/');
      router.refresh();
      return;
    }
    setRows((rs) => (rs ?? []).filter((r) => r.id !== row.id));
  }

  return (
    <section className="card space-y-3">
      <div>
        <h2 className="font-display text-lg font-semibold">Устройства и сессии</h2>
        <p className="text-sm text-muted">Где выполнен вход в ваш аккаунт. Можно завершить сессию на любом устройстве.</p>
      </div>

      {rows === null ? (
        <div className="space-y-2">
          {[0, 1].map((i) => <div key={i} className="skeleton h-14 rounded-2xl" />)}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted">Активных сессий нет.</p>
      ) : (
        <ul className="divide-y divide-ink/8">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-bg-2 text-ink">
                  <DeviceGlyph label={r.deviceLabel || ''} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{r.deviceLabel || 'Неизвестное устройство'}</span>
                    {r.current && <span className="rounded-full bg-positive/15 px-2 py-0.5 text-[10px] font-medium text-positive">это устройство</span>}
                  </div>
                  <div className="text-xs text-muted">
                    {relativeTime(r.lastSeenAt)}{r.ip && r.ip !== 'неизвестно' ? ` · IP ${r.ip}` : ''}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPending(r)}
                aria-label="Завершить сессию"
                className="rounded-full p-2 text-muted transition-colors hover:bg-negative/10 hover:text-negative"
              >
                <IconTrash size={17} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!pending}
        title="Завершить сессию?"
        danger
        confirmLabel="Завершить"
        message={
          pending?.current
            ? <>Это устройство — <b>{pending?.deviceLabel}</b>. Вы выйдете из аккаунта на нём.</>
            : <>Сессия на устройстве <b>{pending?.deviceLabel}</b> будет завершена — на нём произойдёт выход из аккаунта.</>
        }
        onConfirm={() => { if (pending) revoke(pending); }}
        onClose={() => setPending(null)}
      />
    </section>
  );
}

function DeviceGlyph({ label }: { label: string }) {
  const l = label.toLowerCase();
  const phone = /iphone|телефон|android-телефон/.test(l);
  if (phone) {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="7" y="3" width="10" height="18" rx="2.5" /><path d="M11 18h2" strokeLinecap="round" /></svg>;
  }
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M2 20h20M9 20l.5-4M15 20l-.5-4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

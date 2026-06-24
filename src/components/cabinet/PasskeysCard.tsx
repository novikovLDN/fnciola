'use client';

import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { relativeTime } from '@/lib/relative-time';
import { IconKey, IconTrash } from '@/components/icons';

interface PasskeyRow {
  id: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export function PasskeysCard() {
  const [rows, setRows] = useState<PasskeyRow[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [pending, setPending] = useState<PasskeyRow | null>(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && !!window.PublicKeyCredential);
    load();
  }, []);

  async function load() {
    try {
      const res = await fetch('/api/auth/passkey', { cache: 'no-store' });
      const json = await res.json();
      setRows(json.passkeys ?? []);
    } catch {
      setRows([]);
    }
  }

  async function addPasskey() {
    setMsg('');
    setBusy(true);
    try {
      const { startRegistration } = await import('@simplewebauthn/browser');
      const optRes = await fetch('/api/auth/passkey/register/options', { method: 'POST' });
      const options = await optRes.json();
      if (!optRes.ok) { setMsg(options.error || 'Не удалось начать привязку'); return; }
      const attResp = await startRegistration({ optionsJSON: options });
      const verifyRes = await fetch('/api/auth/passkey/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attResp),
      });
      const json = await verifyRes.json().catch(() => ({}));
      if (!verifyRes.ok) { setMsg(json.error || 'Не удалось привязать passkey'); return; }
      setMsg('Passkey привязан ✓');
      load();
    } catch (e) {
      const name = (e as { name?: string }).name;
      if (name === 'NotAllowedError') setMsg('Привязка отменена');
      else setMsg('Это устройство не поддерживает passkey или произошла ошибка');
    } finally {
      setBusy(false);
    }
  }

  async function remove(row: PasskeyRow) {
    await fetch(`/api/auth/passkey/${row.id}`, { method: 'DELETE' });
    setRows((rs) => (rs ?? []).filter((r) => r.id !== row.id));
  }

  return (
    <section className="card space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-semibold">Passkey (Face ID / Touch ID)</h2>
          <p className="text-sm text-muted">Вход без пароля — по отпечатку, лицу или PIN устройства.</p>
        </div>
        <button onClick={addPasskey} disabled={busy || !supported} className="btn btn-secondary disabled:opacity-50">
          <IconKey size={16} /> {busy ? 'Подождите…' : 'Привязать'}
        </button>
      </div>

      {!supported && <p className="text-sm text-muted">Этот браузер не поддерживает passkey.</p>}
      {msg && <p className="text-sm text-accent">{msg}</p>}

      {rows && rows.length > 0 && (
        <ul className="divide-y divide-ink/8">
          {rows.map((r, i) => (
            <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-grad-brand text-white"><IconKey size={16} /></span>
                <div>
                  <div className="text-sm font-medium">Ключ #{i + 1}</div>
                  <div className="text-xs text-muted">
                    Добавлен {relativeTime(r.createdAt)}{r.lastUsedAt ? ` · вход ${relativeTime(r.lastUsedAt)}` : ''}
                  </div>
                </div>
              </div>
              <button onClick={() => setPending(r)} aria-label="Удалить passkey" className="rounded-full p-2 text-muted transition-colors hover:bg-negative/10 hover:text-negative">
                <IconTrash size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!pending}
        title="Удалить passkey?"
        danger
        confirmLabel="Удалить"
        message="Этим ключом больше нельзя будет войти. Вход по паролю останется доступен."
        onConfirm={() => { if (pending) remove(pending); }}
        onClose={() => setPending(null)}
      />
    </section>
  );
}

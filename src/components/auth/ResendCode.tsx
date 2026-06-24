'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Кнопка «Отправить код повторно» с обратным отсчётом (по умолчанию 60 с).
 * onResend должен вернуть число секунд до следующей возможности (обычно 60),
 * либо значение retryAfter из ответа 429.
 */
export function ResendCode({ onResend, initial = 60 }: { onResend: () => Promise<number>; initial?: number }) {
  const [secs, setSecs] = useState(initial);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback((from: number) => {
    setSecs(from);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setSecs((s) => {
        if (s <= 1 && timer.current) clearInterval(timer.current);
        return s - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    startCountdown(initial);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [startCountdown, initial]);

  async function click() {
    if (secs > 0 || busy) return;
    setBusy(true);
    try {
      const next = await onResend();
      startCountdown(Math.max(1, next || 60));
    } finally {
      setBusy(false);
    }
  }

  return secs > 0 ? (
    <span className="text-xs text-muted">Отправить код повторно через {secs} с</span>
  ) : (
    <button type="button" onClick={click} disabled={busy} className="text-xs font-semibold text-accent hover:underline disabled:opacity-50">
      {busy ? 'Отправляем…' : 'Отправить код повторно'}
    </button>
  );
}

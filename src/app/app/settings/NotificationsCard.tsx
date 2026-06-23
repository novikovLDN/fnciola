'use client';

import { useEffect, useState } from 'react';

/**
 * Управление web-push (§13.2). Ограничение iOS: пуши работают только в PWA,
 * установленной на главный экран (Safari, iOS ≥ 16.4) — это поведение платформы.
 */
export function NotificationsCard() {
  const [perm, setPerm] = useState<NotificationPermission | 'unsupported'>('default');
  const [isIosWeb, setIsIosWeb] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setPerm(supported ? Notification.permission : 'unsupported');
    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsIosWeb(ios && !standalone);
    setIsStandalone(standalone);
  }, []);

  async function enable() {
    if (!('Notification' in window)) return;
    setPerm(await Notification.requestPermission());
  }

  return (
    <section className="card space-y-3">
      <h2 className="font-display text-lg font-semibold">Уведомления</h2>
      {isIosWeb ? (
        <div className="flex items-start gap-3 rounded-bento border border-violet/20 bg-violet/10 p-4 text-sm">
          <span aria-hidden>📲</span>
          <p>
            На iPhone уведомления доступны только после установки приложения:
            нажмите <strong>«Поделиться» → «На экран „Домой”»</strong>, затем включите уведомления.
          </p>
        </div>
      ) : perm === 'unsupported' ? (
        <p className="text-sm text-muted">Браузер не поддерживает web-push.</p>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-muted">
            Статус: {perm === 'granted' ? 'включены' : perm === 'denied' ? 'запрещены в браузере' : 'выключены'}
            {isStandalone && ' · приложение установлено'}
          </div>
          <button className="btn btn-primary" onClick={enable} disabled={perm === 'granted'}>
            {perm === 'granted' ? 'Включены' : 'Включить уведомления'}
          </button>
        </div>
      )}
    </section>
  );
}

'use client';

import { useEffect, useState } from 'react';

/**
 * Управление web-push (§13.2). Учитывает ограничение iOS: пуши работают только
 * в установленной на главный экран PWA (Safari, iOS ≥ 16.4) — это не баг.
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
    const result = await Notification.requestPermission();
    setPerm(result);
    // В проде: подписка через PushManager + POST /api/push/subscribe (VAPID).
  }

  return (
    <section className="bento space-y-3">
      <h2 className="font-display text-lg">Уведомления</h2>

      {isIosWeb ? (
        <div className="flex items-start gap-3 rounded-bento bg-accent-soft/50 p-4 text-sm">
          <span aria-hidden>📲</span>
          <p>
            На iPhone уведомления доступны только после установки приложения:
            нажмите <strong>«Поделиться» → «На экран „Домой”»</strong>, затем включите уведомления из установленного Holdy.
          </p>
        </div>
      ) : perm === 'unsupported' ? (
        <p className="text-sm text-ink/60">Браузер не поддерживает web-push.</p>
      ) : (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-sm text-ink/60">
            Статус: {perm === 'granted' ? 'включены' : perm === 'denied' ? 'запрещены в браузере' : 'выключены'}
            {isStandalone && ' · приложение установлено'}
          </div>
          <button className="btn-accent" onClick={enable} disabled={perm === 'granted'}>
            {perm === 'granted' ? 'Включены' : 'Включить уведомления'}
          </button>
        </div>
      )}
    </section>
  );
}

import { headers } from 'next/headers';

/**
 * Извлекает данные устройства из входящего запроса: IP, User-Agent и
 * человекочитаемую модель устройства/браузера. Нужны для управления
 * устройствами и администрирования/аналитики.
 */
export interface DeviceInfo {
  ip: string;
  userAgent: string;
  label: string;
}

export async function getDeviceInfo(): Promise<DeviceInfo> {
  const h = await headers();
  const userAgent = h.get('user-agent') || '';
  // За прокси (Railway) реальный IP — в x-forwarded-for.
  const fwd = h.get('x-forwarded-for') || '';
  const ip = (fwd.split(',')[0] || h.get('x-real-ip') || '').trim() || 'неизвестно';
  return { ip, userAgent, label: deviceLabel(userAgent) };
}

/** Человекочитаемая метка устройства: «iPhone · Safari», «MacBook · Chrome». */
export function deviceLabel(ua: string): string {
  if (!ua) return 'Неизвестное устройство';
  const u = ua.toLowerCase();

  // ОС / устройство
  let device = 'Устройство';
  if (/iphone/.test(u)) device = 'iPhone';
  else if (/ipad/.test(u)) device = 'iPad';
  else if (/android/.test(u)) device = /mobile/.test(u) ? 'Android-телефон' : 'Android-планшет';
  else if (/macintosh|mac os x/.test(u)) device = 'Mac';
  else if (/windows/.test(u)) device = 'Windows';
  else if (/linux/.test(u)) device = 'Linux';

  // Браузер
  let browser = '';
  if (/edg\//.test(u)) browser = 'Edge';
  else if (/opr\/|opera/.test(u)) browser = 'Opera';
  else if (/yabrowser/.test(u)) browser = 'Yandex';
  else if (/chrome\//.test(u) && !/edg\//.test(u)) browser = 'Chrome';
  else if (/firefox/.test(u)) browser = 'Firefox';
  else if (/safari/.test(u) && /version\//.test(u)) browser = 'Safari';

  return browser ? `${device} · ${browser}` : device;
}

/** Короткий публичный ID пользователя для администрирования: HLD-XXXXXX. */
export function generatePublicId(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `HLD-${s}`;
}

import 'server-only';
import { cookies, headers } from 'next/headers';
import { isProduction } from '@/lib/env';

/**
 * Конфигурация Relying Party (RP). За прокси (Railway) реальный домен, который
 * видел браузер, приходит в x-forwarded-host — он и определяет origin/rpID,
 * иначе WebAuthn отклонит проверку из-за несовпадения origin.
 */
export async function getRpConfig(): Promise<{ rpID: string; rpName: string; origin: string }> {
  const h = await headers();
  const host = (h.get('x-forwarded-host') || h.get('host') || 'localhost:3000').split(',')[0].trim();
  const proto = (h.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https')).split(',')[0].trim();
  return { rpID: host.split(':')[0], rpName: 'Holdy', origin: `${proto}://${host}` };
}

const CHALLENGE_COOKIE = 'holdy_webauthn';

export interface ChallengePayload {
  challenge: string;
  userId?: string;
}

export async function setChallenge(payload: ChallengePayload): Promise<void> {
  const store = await cookies();
  store.set(CHALLENGE_COOKIE, JSON.stringify(payload), {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 300,
  });
}

export async function getChallenge(): Promise<ChallengePayload | null> {
  const store = await cookies();
  const raw = store.get(CHALLENGE_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ChallengePayload;
  } catch {
    return null;
  }
}

export async function clearChallenge(): Promise<void> {
  const store = await cookies();
  store.delete(CHALLENGE_COOKIE);
}

import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { and, eq, gt, desc } from 'drizzle-orm';
import { db } from '@/db/client';
import { sessions, users } from '@/db/schema';
import { isProduction } from '@/lib/env';
import { getDeviceInfo } from './device';

const COOKIE = 'holdy_session';
const TTL_DAYS = 30;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Создаёт сессию для пользователя (с данными устройства) и ставит cookie. */
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + TTL_DAYS * 86_400_000);
  const device = await getDeviceInfo();

  await db.insert(sessions).values({
    userId,
    tokenHash: hashToken(token),
    deviceLabel: device.label,
    userAgent: device.userAgent,
    ip: device.ip,
    expiresAt,
  });

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export interface SessionUser {
  id: string;
  email: string;
  displayCurrency: string;
}

/** Текущий пользователь по cookie. Также обновляет lastSeenAt сессии. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  const tokenHash = hashToken(token);

  const rows = await db
    .select({ id: users.id, email: users.email, displayCurrency: users.displayCurrency, sessionId: sessions.id, lastSeenAt: sessions.lastSeenAt })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  // Троттлим обновление «онлайн» — не чаще раза в 5 минут.
  if (Date.now() - new Date(row.lastSeenAt).getTime() > 5 * 60_000) {
    await db.update(sessions).set({ lastSeenAt: new Date() }).where(eq(sessions.id, row.sessionId));
  }

  return { id: row.id, email: row.email, displayCurrency: row.displayCurrency };
}

/** ID текущей сессии (для пометки «это устройство»). */
export async function getCurrentSessionId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  const rows = await db.select({ id: sessions.id }).from(sessions).where(eq(sessions.tokenHash, hashToken(token))).limit(1);
  return rows[0]?.id ?? null;
}

export interface SessionRow {
  id: string;
  deviceLabel: string | null;
  ip: string | null;
  lastSeenAt: Date;
  createdAt: Date;
  current: boolean;
}

/** Список активных сессий пользователя (устройства). */
export async function listSessions(userId: string): Promise<SessionRow[]> {
  const currentId = await getCurrentSessionId();
  const rows = await db
    .select({ id: sessions.id, deviceLabel: sessions.deviceLabel, ip: sessions.ip, lastSeenAt: sessions.lastSeenAt, createdAt: sessions.createdAt })
    .from(sessions)
    .where(and(eq(sessions.userId, userId), gt(sessions.expiresAt, new Date())))
    .orderBy(desc(sessions.lastSeenAt));
  return rows.map((r) => ({ ...r, current: r.id === currentId }));
}

/** Отзывает (удаляет) сессию устройства. Возвращает true, если это была текущая. */
export async function revokeSession(userId: string, sessionId: string): Promise<{ wasCurrent: boolean }> {
  const currentId = await getCurrentSessionId();
  await db.delete(sessions).where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)));
  const wasCurrent = sessionId === currentId;
  if (wasCurrent) {
    const store = await cookies();
    store.delete(COOKIE);
  }
  return { wasCurrent };
}

/** Завершает текущую сессию (выход). */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  store.delete(COOKIE);
}

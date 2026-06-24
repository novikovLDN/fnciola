import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { getDeviceInfo, generatePublicId } from './device';

async function uniquePublicId(): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const id = generatePublicId();
    const hit = await db.select({ id: users.id }).from(users).where(eq(users.publicId, id)).limit(1);
    if (hit.length === 0) return id;
  }
  return `HLD-${Date.now().toString(36).toUpperCase()}`;
}

/** Записывает данные входа (для администрирования/аналитики) и гарантирует publicId. */
export async function recordLogin(userId: string): Promise<void> {
  const device = await getDeviceInfo();
  const row = await db.select({ publicId: users.publicId }).from(users).where(eq(users.id, userId)).limit(1);
  const publicId = row[0]?.publicId ?? (await uniquePublicId());
  await db
    .update(users)
    .set({ lastLoginAt: new Date(), lastIp: device.ip, lastUserAgent: device.userAgent, publicId, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

/** Записывает данные регистрации (первое устройство/IP) и выдаёт publicId. */
export async function recordSignup(userId: string): Promise<void> {
  const device = await getDeviceInfo();
  const publicId = await uniquePublicId();
  await db
    .update(users)
    .set({
      signupIp: device.ip,
      signupUserAgent: device.userAgent,
      lastLoginAt: new Date(),
      lastIp: device.ip,
      lastUserAgent: device.userAgent,
      publicId,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

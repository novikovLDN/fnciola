import { createHash, randomInt } from 'node:crypto';
import { and, eq, gt, isNull, desc } from 'drizzle-orm';
import { db } from '@/db/client';
import { authEmailCodes } from '@/db/schema';

export type OtpPurpose = 'register' | 'login' | 'recovery';

const TTL_MINUTES = 10;

function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

export function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

const RESEND_COOLDOWN_SEC = 60;

/**
 * Сколько секунд осталось до возможности повторно запросить код для
 * email+purpose (антиспам: не чаще раза в минуту). 0 — можно прямо сейчас.
 */
export async function cooldownRemaining(email: string, purpose: OtpPurpose): Promise<number> {
  const rows = await db
    .select({ createdAt: authEmailCodes.createdAt })
    .from(authEmailCodes)
    .where(and(eq(authEmailCodes.email, email.toLowerCase()), eq(authEmailCodes.purpose, purpose)))
    .orderBy(desc(authEmailCodes.createdAt))
    .limit(1);
  if (!rows[0]) return 0;
  const elapsedSec = (Date.now() - new Date(rows[0].createdAt).getTime()) / 1000;
  return Math.max(0, Math.ceil(RESEND_COOLDOWN_SEC - elapsedSec));
}

/** Создаёт и сохраняет OTP-код для email+purpose, возвращает «сырой» код для отправки. */
export async function issueCode(email: string, purpose: OtpPurpose): Promise<string> {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + TTL_MINUTES * 60_000);
  await db.insert(authEmailCodes).values({
    email: email.toLowerCase(),
    codeHash: hashCode(code),
    purpose,
    expiresAt,
  });
  return code;
}

/**
 * Проверяет код. consume=true помечает его использованным (одноразовость).
 * Возвращает true, если есть действующий неиспользованный код с таким хешем.
 */
export async function checkCode(email: string, code: string, purpose: OtpPurpose, consume: boolean): Promise<boolean> {
  const now = new Date();
  const rows = await db
    .select()
    .from(authEmailCodes)
    .where(
      and(
        eq(authEmailCodes.email, email.toLowerCase()),
        eq(authEmailCodes.purpose, purpose),
        eq(authEmailCodes.codeHash, hashCode(code)),
        isNull(authEmailCodes.consumedAt),
        gt(authEmailCodes.expiresAt, now),
      ),
    )
    .orderBy(desc(authEmailCodes.createdAt))
    .limit(1);

  const row = rows[0];
  if (!row) return false;
  if (consume) {
    await db.update(authEmailCodes).set({ consumedAt: now }).where(eq(authEmailCodes.id, row.id));
  }
  return true;
}

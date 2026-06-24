import { NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/db/client';
import { authPasskeys } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth/session';

export const runtime = 'nodejs';

/** Список passkey текущего пользователя. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  const rows = await db
    .select({ id: authPasskeys.id, createdAt: authPasskeys.createdAt, lastUsedAt: authPasskeys.lastUsedAt })
    .from(authPasskeys)
    .where(eq(authPasskeys.userId, user.id))
    .orderBy(desc(authPasskeys.createdAt));
  return NextResponse.json({ passkeys: rows });
}

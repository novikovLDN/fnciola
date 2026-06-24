import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { authPasskeys } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth/session';

export const runtime = 'nodejs';

/** Удаление passkey пользователя. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  const { id } = await params;
  await db.delete(authPasskeys).where(and(eq(authPasskeys.id, id), eq(authPasskeys.userId, user.id)));
  return NextResponse.json({ ok: true });
}

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { userLedger } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth/session';

export const runtime = 'nodejs';

const EMPTY = { accounts: [], txs: [], projects: [], entries: [] };

/** Загрузка всех данных текущего пользователя. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const rows = await db.select({ data: userLedger.data }).from(userLedger).where(eq(userLedger.userId, user.id)).limit(1);
  return NextResponse.json({ data: rows[0]?.data ?? EMPTY, email: user.email });
}

/** Сохранение всех данных пользователя (полный снимок, upsert). */
export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 });

  await db
    .insert(userLedger)
    .values({ userId: user.id, data: body, updatedAt: new Date() })
    .onConflictDoUpdate({ target: userLedger.userId, set: { data: body, updatedAt: new Date() } });

  return NextResponse.json({ ok: true });
}

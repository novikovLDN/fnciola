import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { verifyPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { recordLogin } from '@/lib/auth/users';

export const runtime = 'nodejs';

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Введите email и пароль' }, { status: 400 });
  const email = parsed.data.email.toLowerCase();

  const rows = await db.select({ id: users.id, hash: users.passwordHash }).from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];
  // Единое сообщение, чтобы не раскрывать существование аккаунта.
  if (!user || !user.hash || !(await verifyPassword(parsed.data.password, user.hash))) {
    return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 });
  }

  await createSession(user.id);
  await recordLogin(user.id);
  return NextResponse.json({ ok: true });
}

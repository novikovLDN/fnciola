import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { checkCode } from '@/lib/auth/otp';
import { hashPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { recordLogin } from '@/lib/auth/users';

export const runtime = 'nodejs';

const schema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Проверьте данные (пароль ≥ 8 символов)' }, { status: 400 });
  const { email, code, password } = parsed.data;
  const normEmail = email.toLowerCase();

  const ok = await checkCode(normEmail, code, 'recovery', true);
  if (!ok) return NextResponse.json({ error: 'Неверный или просроченный код' }, { status: 400 });

  const rows = await db.select({ id: users.id }).from(users).where(eq(users.email, normEmail)).limit(1);
  if (!rows[0]) return NextResponse.json({ error: 'Аккаунт не найден' }, { status: 404 });

  await db.update(users).set({ passwordHash: await hashPassword(password), updatedAt: new Date() }).where(eq(users.id, rows[0].id));
  await createSession(rows[0].id);
  await recordLogin(rows[0].id);
  return NextResponse.json({ ok: true });
}

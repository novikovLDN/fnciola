import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { checkCode } from '@/lib/auth/otp';
import { hashPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { recordSignup, recordLogin } from '@/lib/auth/users';

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

  // Гасим код (одноразовость) — он подтверждает владение почтой.
  const ok = await checkCode(normEmail, code, 'register', true);
  if (!ok) return NextResponse.json({ error: 'Неверный или просроченный код' }, { status: 400 });

  const passwordHash = await hashPassword(password);

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, normEmail)).limit(1);
  let userId: string;
  if (existing[0]) {
    userId = existing[0].id;
    await db.update(users).set({ passwordHash, emailVerifiedAt: new Date(), updatedAt: new Date() }).where(eq(users.id, userId));
  } else {
    const inserted = await db.insert(users).values({ email: normEmail, passwordHash, emailVerifiedAt: new Date() }).returning({ id: users.id });
    userId = inserted[0].id;
  }

  await createSession(userId);
  if (existing[0]) await recordLogin(userId);
  else await recordSignup(userId);
  return NextResponse.json({ ok: true });
}

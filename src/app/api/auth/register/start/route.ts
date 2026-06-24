import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { issueCode } from '@/lib/auth/otp';
import { sendOtpEmail } from '@/lib/auth/email';

export const runtime = 'nodejs';

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Некорректный email' }, { status: 400 });

  const email = parsed.data.email.toLowerCase();

  // Если пользователь уже есть и у него задан пароль — регистрация не нужна.
  const existing = await db.select({ id: users.id, hash: users.passwordHash }).from(users).where(eq(users.email, email)).limit(1);
  if (existing[0]?.hash) {
    return NextResponse.json({ error: 'Аккаунт с таким email уже существует. Войдите или восстановите пароль.' }, { status: 409 });
  }

  const code = await issueCode(email, 'register');
  const { devCode } = await sendOtpEmail(email, code, 'register');
  return NextResponse.json({ ok: true, ...(devCode ? { devCode } : {}) });
}

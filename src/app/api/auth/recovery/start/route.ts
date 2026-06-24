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
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Некорректный email' }, { status: 400 });
  const email = parsed.data.email.toLowerCase();

  const exists = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  // Не раскрываем существование аккаунта: всегда ok. Код шлём только если есть.
  if (!exists[0]) return NextResponse.json({ ok: true });

  const code = await issueCode(email, 'recovery');
  const { devCode } = await sendOtpEmail(email, code, 'recovery');
  return NextResponse.json({ ok: true, ...(devCode ? { devCode } : {}) });
}

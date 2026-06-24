import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkCode } from '@/lib/auth/otp';

export const runtime = 'nodejs';

const schema = z.object({ email: z.string().email(), code: z.string().regex(/^\d{6}$/) });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Введите 6-значный код' }, { status: 400 });

  // Проверяем код без «погашения» — он понадобится на шаге установки пароля.
  const ok = await checkCode(parsed.data.email, parsed.data.code, 'register', false);
  if (!ok) return NextResponse.json({ error: 'Неверный или просроченный код' }, { status: 400 });

  return NextResponse.json({ ok: true });
}

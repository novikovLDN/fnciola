import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { db } from '@/db/client';
import { users, authPasskeys } from '@/db/schema';
import { getRpConfig, setChallenge } from '@/lib/auth/passkey';

export const runtime = 'nodejs';

const schema = z.object({ email: z.string().email() });

/** Опции для входа по passkey (по email пользователя). */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Введите корректный email' }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const u = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (!u[0]) return NextResponse.json({ error: 'Для этого email нет passkey' }, { status: 404 });

  const creds = await db.select({ credentialId: authPasskeys.credentialId, transports: authPasskeys.transports }).from(authPasskeys).where(eq(authPasskeys.userId, u[0].id));
  if (creds.length === 0) return NextResponse.json({ error: 'Для этого аккаунта нет passkey' }, { status: 404 });

  const { rpID } = await getRpConfig();
  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: creds.map((c) => ({ id: c.credentialId, transports: (c.transports?.split(',') as never) || undefined })),
    userVerification: 'preferred',
  });

  await setChallenge({ challenge: options.challenge, userId: u[0].id });
  return NextResponse.json(options);
}

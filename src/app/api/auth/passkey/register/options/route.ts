import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { db } from '@/db/client';
import { authPasskeys } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth/session';
import { getRpConfig, setChallenge } from '@/lib/auth/passkey';

export const runtime = 'nodejs';

/** Опции для регистрации нового passkey (authed). */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const { rpID, rpName } = await getRpConfig();
  const existing = await db.select({ credentialId: authPasskeys.credentialId, transports: authPasskeys.transports }).from(authPasskeys).where(eq(authPasskeys.userId, user.id));

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: new TextEncoder().encode(user.id),
    userName: user.email,
    attestationType: 'none',
    excludeCredentials: existing.map((c) => ({ id: c.credentialId, transports: (c.transports?.split(',') as never) || undefined })),
    authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' },
  });

  await setChallenge({ challenge: options.challenge });
  return NextResponse.json(options);
}

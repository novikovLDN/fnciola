import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { db } from '@/db/client';
import { authPasskeys } from '@/db/schema';
import { getRpConfig, getChallenge, clearChallenge } from '@/lib/auth/passkey';
import { createSession } from '@/lib/auth/session';
import { recordLogin } from '@/lib/auth/users';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const saved = await getChallenge();
  if (!body || !saved?.userId) return NextResponse.json({ error: 'Сессия входа истекла' }, { status: 400 });

  const credId = body.id as string;
  const rows = await db.select().from(authPasskeys).where(and(eq(authPasskeys.userId, saved.userId), eq(authPasskeys.credentialId, credId))).limit(1);
  const cred = rows[0];
  if (!cred) return NextResponse.json({ error: 'Passkey не найден' }, { status: 400 });

  const { rpID, origin } = await getRpConfig();
  try {
    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: saved.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: cred.credentialId,
        publicKey: isoBase64URL.toBuffer(cred.publicKey),
        counter: Number(cred.counter),
        transports: (cred.transports?.split(',') as never) || undefined,
      },
    });
    if (!verification.verified) return NextResponse.json({ error: 'Проверка не пройдена' }, { status: 400 });

    await db.update(authPasskeys).set({ counter: verification.authenticationInfo.newCounter, lastUsedAt: new Date() }).where(eq(authPasskeys.id, cred.id));
    await clearChallenge();
    await createSession(saved.userId);
    await recordLogin(saved.userId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Ошибка проверки' }, { status: 400 });
  }
}

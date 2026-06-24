import { NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { db } from '@/db/client';
import { authPasskeys } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth/session';
import { getRpConfig, getChallenge, clearChallenge } from '@/lib/auth/passkey';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const saved = await getChallenge();
  if (!body || !saved) return NextResponse.json({ error: 'Сессия регистрации истекла' }, { status: 400 });

  const { rpID, origin } = await getRpConfig();
  try {
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: saved.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: 'Не удалось подтвердить passkey' }, { status: 400 });
    }
    const { credential } = verification.registrationInfo;
    await db.insert(authPasskeys).values({
      userId: user.id,
      credentialId: credential.id,
      publicKey: isoBase64URL.fromBuffer(credential.publicKey),
      counter: credential.counter,
      transports: credential.transports?.join(',') ?? null,
    });
    await clearChallenge();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Ошибка проверки' }, { status: 400 });
  }
}

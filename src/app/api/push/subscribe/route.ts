import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * POST /api/push/subscribe (§13, §16). Сохранение web-push подписки.
 * В проде: привязка к user_id сессии, запись в push_subscriptions, аудит.
 */
const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  platform: z.string().optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Невалидный JSON' }, { status: 400 });
  }

  const parsed = subscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Невалидная подписка' }, { status: 400 });
  }

  // TODO(prod): upsert в push_subscriptions по endpoint + user_id сессии.
  return NextResponse.json({ ok: true });
}

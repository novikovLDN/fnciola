import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * POST /api/webhooks/platecha (§12, §16). Вебхуки платёжного провайдера:
 * успешная оплата, неудачное списание (past_due), отмена, истечение.
 *
 * Безопасность: проверяем подпись запроса по общему секрету
 * PLATECHA_WEBHOOK_SECRET (HMAC), прежде чем менять subscription_status.
 * Карточные данные через наш сервер не проходят (§6).
 */
export async function POST(req: NextRequest) {
  const secret = process.env.PLATECHA_WEBHOOK_SECRET;
  if (!secret) {
    // Не сконфигурировано — не подтверждаем приём, чтобы провайдер повторил.
    return NextResponse.json({ error: 'Webhook не сконфигурирован' }, { status: 503 });
  }

  const raw = await req.text();
  const signature = req.headers.get('x-platecha-signature') ?? '';

  if (!verifySignature(raw, signature, secret)) {
    return NextResponse.json({ error: 'Неверная подпись' }, { status: 401 });
  }

  let event: { type?: string; subscriptionId?: string; status?: string; periodEnd?: string };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Невалидный JSON' }, { status: 400 });
  }

  // Маппинг событий провайдера на наш статус (§12).
  switch (event.type) {
    case 'payment.succeeded':
    case 'subscription.renewed':
      // TODO(prod): subscriptions.status='active', обновить current_period_end и users.subscription_until.
      break;
    case 'payment.failed':
      // TODO(prod): status='past_due'.
      break;
    case 'subscription.canceled':
      // TODO(prod): status='canceled', auto_renew=false (доступ до конца периода).
      break;
    case 'subscription.expired':
      // TODO(prod): status='expired'.
      break;
    default:
      // Неизвестные события подтверждаем, чтобы не копились ретраи.
      break;
  }

  return NextResponse.json({ received: true });
}

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = createHmac('sha256', secret).update(payload).digest('hex');
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

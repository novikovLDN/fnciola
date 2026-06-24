import { NextResponse } from 'next/server';
import { getCurrentUser, revokeSession } from '@/lib/auth/session';

export const runtime = 'nodejs';

/** Отзыв (удаление) сессии устройства. Если это текущее устройство — выход. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  const { id } = await params;
  const { wasCurrent } = await revokeSession(user.id, id);
  return NextResponse.json({ ok: true, wasCurrent });
}

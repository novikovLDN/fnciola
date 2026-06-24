import { NextResponse } from 'next/server';
import { getCurrentUser, listSessions } from '@/lib/auth/session';

export const runtime = 'nodejs';

/** Список устройств/сессий текущего пользователя. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  const sessions = await listSessions(user.id);
  return NextResponse.json({ sessions });
}

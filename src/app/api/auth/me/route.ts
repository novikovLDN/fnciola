import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth/session';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ user: null }, { status: 200 });

  const rows = await db
    .select({ email: users.email, displayCurrency: users.displayCurrency, publicId: users.publicId, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, session.id))
    .limit(1);

  return NextResponse.json({ user: rows[0] ?? { email: session.email, displayCurrency: session.displayCurrency } });
}

import { NextResponse } from 'next/server';

/**
 * Healthcheck (Аддендум №1, §6): 200 OK + лёгкий ping БД.
 * Прописан в railway.json как healthcheckPath.
 *
 * БД пингуется опционально: если DATABASE_URL не задан (например, при сборке),
 * сервис всё равно считается живым, но в ответе это отражается.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  let database: 'ok' | 'down' | 'unconfigured' = 'unconfigured';

  if (process.env.DATABASE_URL) {
    try {
      const { pingDatabase } = await import('@/db/client');
      database = (await pingDatabase()) ? 'ok' : 'down';
    } catch {
      database = 'down';
    }
  }

  const healthy = database !== 'down';
  return NextResponse.json(
    {
      status: healthy ? 'ok' : 'degraded',
      service: 'holdy-web',
      database,
      ts: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}

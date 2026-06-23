import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { computeMetrics } from '@/lib/metrics';
import { demoProjectEntries, demoCashBalance } from '@/lib/demo';

/**
 * GET /api/projects/:id/metrics?from&to — расчёт метрик за период (§16, §10).
 *
 * В проде: сессия → фильтрация project_entries по user_id и project_id (§6),
 * проверка canUse('business_module', user) (§3). Здесь демонстрируется контракт
 * и сам расчёт на проверенном движке metrics.ts (демо-данные).
 */
const querySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'from: ожидается YYYY-MM-DD'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'to: ожидается YYYY-MM-DD'),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);

  const parsed = querySchema.safeParse({
    from: searchParams.get('from'),
    to: searchParams.get('to'),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map((i) => i.message) }, { status: 400 });
  }
  if (parsed.data.from > parsed.data.to) {
    return NextResponse.json({ error: 'from не может быть позже to' }, { status: 400 });
  }

  const metrics = computeMetrics(demoProjectEntries, parsed.data, { cashBalance: demoCashBalance });

  return NextResponse.json({
    projectId: id,
    period: parsed.data,
    currency: 'RUB',
    metrics,
    disclaimer: 'Управленческая оценка, не бухгалтерская/аудиторская отчётность.',
  });
}

/**
 * Обновление курсов валют (§8). Тянет курсы у выбранного провайдера и
 * сохраняет историю в fx_rates (уникальность по base/quote/rate_date).
 * Запускается по расписанию (ежедневно) через repeatable job.
 */

import { fxEnv } from '@/lib/env';
import type { FxJob } from '../queues';
import type { FxRate } from '@/lib/fx';

export async function processFxJob(job: FxJob): Promise<{ saved: number }> {
  const { FX_PROVIDER } = fxEnv();
  const date = job.date ?? new Date().toISOString().slice(0, 10);

  const rates = await fetchRates(FX_PROVIDER, date);
  await upsertRates(rates);

  return { saved: rates.length };
}

async function fetchRates(provider: string, date: string): Promise<FxRate[]> {
  // TODO(prod): реальные запросы к источнику.
  //  - cbr: https://www.cbr-xml-daily.ru/ (base RUB)
  //  - ecb: https://www.ecb.europa.eu/ (base EUR)
  //  - openexchangerates: с FX_API_KEY (base USD), мультивалютный охват
  // Все адреса/ключи — только через env (Аддендум №1, §3).
  void provider;
  void date;
  return [];
}

async function upsertRates(_rates: FxRate[]): Promise<void> {
  // TODO(prod): INSERT ... ON CONFLICT (base, quote, rate_date) DO UPDATE.
}

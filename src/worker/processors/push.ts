/**
 * Рассылка web-push уведомлений (§13). Использует VAPID-ключи из env.
 * На MVP — инфраструктура и одно тестовое уведомление (§13.2).
 */

import type { PushJob } from '../queues';

export async function processPushJob(job: PushJob): Promise<{ sent: number; failed: number }> {
  // TODO(prod):
  //  1. SELECT push_subscriptions WHERE user_id=job.userId
  //  2. для каждой — web-push send с VAPID (env: VAPID_PUBLIC_KEY/PRIVATE_KEY/SUBJECT)
  //  3. удалить подписки, вернувшие 404/410 (устаревшие)
  void job;
  return { sent: 0, failed: 0 };
}

/**
 * Определения очередей BullMQ (§5.1, Аддендум №1, §1).
 * Тяжёлые операции выносятся в очередь: импорт выписок, рассылки push/почты,
 * пересчёт метрик, обновление курсов валют.
 */

import { Queue, type ConnectionOptions } from 'bullmq';
import { redisEnv } from '@/lib/env';

export const QUEUE_NAMES = {
  import: 'import',
  push: 'push',
  email: 'email',
  metrics: 'metrics',
  fx: 'fx',
} as const;

// Полезные нагрузки задач
export interface ImportJob {
  importBatchId: string;
  userId: string;
}
export interface PushJob {
  userId: string;
  title: string;
  body: string;
}
export interface FxJob {
  date?: string; // YYYY-MM-DD; по умолчанию — сегодня
}

let connection: ConnectionOptions | null = null;

export function getConnection(): ConnectionOptions {
  if (!connection) {
    const { REDIS_URL } = redisEnv();
    // BullMQ принимает строку URL как connection.
    connection = { url: REDIS_URL } as unknown as ConnectionOptions;
  }
  return connection;
}

export function makeQueue<T>(name: string): Queue<T> {
  return new Queue<T>(name, { connection: getConnection() });
}

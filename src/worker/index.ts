/**
 * Worker-процесс (Аддендум №1, §1/§4): обработчики очередей BullMQ.
 *
 * Запуск: `npm run worker` (или `node dist/worker.js` в проде).
 * Не открывает HTTP-порт. Не выполняет миграции БД (только web pre-deploy, §5).
 * Биндинг на 0.0.0.0/::, IPv6-совместимость обеспечивается Redis-клиентом.
 */

import { Worker } from 'bullmq';
import { QUEUE_NAMES, getConnection, type ImportJob, type FxJob, type PushJob } from './queues';
import { processImportJob } from './processors/import';
import { processFxJob } from './processors/fx';
import { processPushJob } from './processors/push';

function log(scope: string, msg: string, extra?: unknown) {
  // Логи в stdout — Railway собирает автоматически (Аддендум №1, §6).
  console.log(JSON.stringify({ ts: new Date().toISOString(), scope, msg, extra }));
}

async function main() {
  const connection = getConnection();

  const workers = [
    new Worker<ImportJob>(QUEUE_NAMES.import, async (job) => processImportJob(job.data), { connection }),
    new Worker<FxJob>(QUEUE_NAMES.fx, async (job) => processFxJob(job.data), { connection }),
    new Worker<PushJob>(QUEUE_NAMES.push, async (job) => processPushJob(job.data), { connection }),
  ];

  for (const w of workers) {
    w.on('completed', (job) => log(w.name, 'job completed', { id: job.id }));
    w.on('failed', (job, err) => log(w.name, 'job failed', { id: job?.id, err: err?.message }));
  }

  log('worker', 'Holdy worker запущен', { queues: Object.values(QUEUE_NAMES) });

  // Грациозное завершение
  const shutdown = async () => {
    log('worker', 'остановка…');
    await Promise.all(workers.map((w) => w.close()));
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  console.error('worker fatal', err);
  process.exit(1);
});

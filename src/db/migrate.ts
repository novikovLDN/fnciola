/**
 * Запуск миграций БД (Аддендум №1, §5).
 *
 * Выполняется в Pre-Deploy Command сервиса web (`npm run db:migrate`), ДО старта
 * приложения. Идемпотентен: drizzle-orm ведёт журнал применённых миграций в
 * служебной таблице и не применяет их повторно.
 *
 * Использует отдельное соединение (max: 1) — миграции не должны конкурировать
 * с пулом приложения. Берёт строку подключения строго из DATABASE_URL; при её
 * отсутствии падает с понятным сообщением, а НЕ молча уходит на localhost.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function main() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    console.error(
      [
        '✗ DATABASE_URL не задан — миграции выполнить нельзя.',
        '',
        'На Railway добавьте сервису web reference-переменную (Аддендум №1, §2/§3):',
        '    DATABASE_URL=${{Postgres.DATABASE_URL}}',
        '',
        'Локально — экспортируйте DATABASE_URL или задайте его в .env.local.',
      ].join('\n'),
    );
    process.exit(1);
  }

  // Включаем SSL только для публичных хостов; внутренняя сеть Railway
  // (*.railway.internal) работает без TLS (Аддендум №1, §2).
  const isInternal = url.includes('.railway.internal');
  const forceSsl = /sslmode=require/.test(url);
  const ssl = !isInternal && forceSsl ? ('require' as const) : (false as const);

  const sql = postgres(url, { max: 1, ssl, onnotice: () => {} });

  try {
    console.log('→ Применение миграций Drizzle…');
    const started = Date.now();
    await migrate(drizzle(sql), { migrationsFolder: './drizzle' });
    console.log(`✓ Миграции применены за ${Date.now() - started} мс`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error('✗ Ошибка миграции:', err instanceof Error ? err.message : err);
  process.exit(1);
});

import type { Config } from 'drizzle-kit';

/**
 * Конфиг Drizzle Kit. DATABASE_URL берётся из окружения (Аддендум №1, §3).
 * Миграции выполняются в Pre-Deploy Command сервиса web (§5).
 */
export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://holdy:holdy@localhost:5432/holdy',
  },
  strict: true,
  verbose: true,
} satisfies Config;

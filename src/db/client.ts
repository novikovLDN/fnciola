/**
 * Клиент БД (Drizzle + postgres.js) с единым общим пулом (Аддендум №1, §2).
 *
 *  - Один общий пул на инстанс (ленивая инициализация — не на этапе сборки).
 *  - Лимит коннектов через DB_POOL_MAX (дефолт 10).
 *  - SSL определяется строкой подключения (internal — без TLS).
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { dbEnv } from '../lib/env';
import * as schema from './schema';

type Sql = ReturnType<typeof postgres>;
type Db = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as { __holdyPg?: Sql; __holdyDb?: Db };

function createPool(): Sql {
  const { DATABASE_URL, DB_POOL_MAX } = dbEnv();
  return postgres(DATABASE_URL, {
    max: DB_POOL_MAX,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
  });
}

/** Ленивая инициализация пула и drizzle — только при первом обращении (рантайм). */
function getSql(): Sql {
  if (!globalForDb.__holdyPg) globalForDb.__holdyPg = createPool();
  return globalForDb.__holdyPg;
}

function getDb(): Db {
  if (!globalForDb.__holdyDb) globalForDb.__holdyDb = drizzle(getSql(), { schema });
  return globalForDb.__holdyDb;
}

// Прокси: `import { db }` работает как обычно, но пул создаётся лениво.
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(real) : value;
  },
});

export type Database = Db;

/** Лёгкий ping БД для healthcheck (Аддендум №1, §6). */
export async function pingDatabase(): Promise<boolean> {
  try {
    const sql = getSql();
    await sql`select 1`;
    return true;
  } catch {
    return false;
  }
}

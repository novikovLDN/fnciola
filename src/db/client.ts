/**
 * Клиент БД (Drizzle + postgres.js) с единым общим пулом (Аддендум №1, §2).
 *
 *  - Один общий пул на инстанс (не открывать пул на каждый запрос).
 *  - Лимит коннектов через DB_POOL_MAX (дефолт 10), чтобы не упереться в лимит
 *    Postgres при масштабировании реплик.
 *  - SSL не навязываем для internal-подключения по приватной сети Railway;
 *    параметры берём из самого DATABASE_URL.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { dbEnv } from '../lib/env';
import * as schema from './schema';

// Глобальный кеш для dev/HMR — чтобы не плодить пулы при горячей перезагрузке.
const globalForDb = globalThis as unknown as {
  __holdyPg?: ReturnType<typeof postgres>;
};

function createPool() {
  const { DATABASE_URL, DB_POOL_MAX } = dbEnv();
  return postgres(DATABASE_URL, {
    max: DB_POOL_MAX,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    // SSL определяется строкой подключения (internal — без TLS, public — с TLS).
  });
}

export const sql = globalForDb.__holdyPg ?? createPool();
if (process.env.NODE_ENV !== 'production') {
  globalForDb.__holdyPg = sql;
}

export const db = drizzle(sql, { schema });

export type Database = typeof db;

/** Лёгкий ping БД для healthcheck (Аддендум №1, §6). */
export async function pingDatabase(): Promise<boolean> {
  try {
    await sql`select 1`;
    return true;
  } catch {
    return false;
  }
}

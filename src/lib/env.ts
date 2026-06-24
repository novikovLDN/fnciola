/**
 * Единый типизированный доступ к конфигурации через переменные окружения.
 * (Аддендум №1, §3: никаких секретов/адресов в коде — только env.)
 *
 * Валидация через zod. Обязательные переменные проверяются лениво при первом
 * обращении к соответствующей группе, чтобы:
 *  - `web` не падал из-за отсутствия, например, PLATECHA_* в окружении сборки;
 *  - но критичные для рантайма переменные (DATABASE_URL и т.п.) валидировались.
 *
 * ВАЖНО: приложение слушает process.env.PORT и биндится на 0.0.0.0 (Railway, §4).
 */

import { z } from 'zod';

const bool = z
  .string()
  .optional()
  .transform((v) => v === 'true' || v === '1');

// --- Базовое окружение (всегда доступно) -----------------------------------

const baseSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  APP_URL: z.string().url().default('http://localhost:3000'),
});

export const env = baseSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  APP_URL: process.env.APP_URL ?? process.env.BETTER_AUTH_URL,
});

export const isProduction = env.NODE_ENV === 'production';

/**
 * Хелпер: валидирует и кеширует группу переменных. Падает с понятной ошибкой,
 * если обязательная переменная отсутствует (Аддендум №1, §3).
 */
function lazy<T>(name: string, build: () => T): () => T {
  let cached: T | undefined;
  let resolved = false;
  return () => {
    if (!resolved) {
      try {
        cached = build();
        resolved = true;
      } catch (err) {
        if (err instanceof z.ZodError) {
          const missing = err.issues.map((i) => i.path.join('.')).join(', ');
          throw new Error(`[env] Группа "${name}": некорректные/отсутствующие переменные: ${missing}`);
        }
        throw err;
      }
    }
    return cached as T;
  };
}

// --- БД (Аддендум №1, §2) --------------------------------------------------

export const dbEnv = lazy('database', () =>
  z
    .object({
      DATABASE_URL: z.string().min(1, 'DATABASE_URL обязателен'),
      // Лимит пула на инстанс (§2): не открывать новый пул на каждый запрос.
      DB_POOL_MAX: z.coerce.number().int().positive().default(10),
    })
    .parse({
      DATABASE_URL: process.env.DATABASE_URL,
      DB_POOL_MAX: process.env.DB_POOL_MAX,
    }),
);

// --- Redis / очереди --------------------------------------------------------

export const redisEnv = lazy('redis', () =>
  z.object({ REDIS_URL: z.string().min(1) }).parse({ REDIS_URL: process.env.REDIS_URL }),
);

// --- Auth (Better Auth) -----------------------------------------------------

export const authEnv = lazy('auth', () =>
  z
    .object({
      BETTER_AUTH_SECRET: z.string().min(16, 'BETTER_AUTH_SECRET слишком короткий'),
      BETTER_AUTH_URL: z.string().url().default(env.APP_URL),
      APP_ENCRYPTION_KEY: z.string().min(1).optional(),
    })
    .parse({
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
      APP_ENCRYPTION_KEY: process.env.APP_ENCRYPTION_KEY,
    }),
);

// --- Web Push (VAPID) -------------------------------------------------------

export const pushEnv = lazy('push', () =>
  z
    .object({
      VAPID_PUBLIC_KEY: z.string().min(1),
      VAPID_PRIVATE_KEY: z.string().min(1),
      VAPID_SUBJECT: z.string().min(1),
    })
    .parse({
      VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
      VAPID_SUBJECT: process.env.VAPID_SUBJECT,
    }),
);

/** Публичный VAPID-ключ безопасно отдавать на клиент (для подписки). */
export function getPublicVapidKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY ?? null;
}

// --- Почта (SMTP) -----------------------------------------------------------

export const mailEnv = lazy('mail', () =>
  z
    .object({
      SMTP_HOST: z.string().min(1),
      SMTP_PORT: z.coerce.number().int().positive(),
      SMTP_USER: z.string().optional(),
      SMTP_PASSWORD: z.string().optional(),
      EMAIL_FROM: z.string().min(1).default('Holdy <no-reply@holdy.app>'),
    })
    .parse({
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASSWORD: process.env.SMTP_PASSWORD,
      EMAIL_FROM: process.env.EMAIL_FROM,
    }),
);

// --- S3-хранилище выписок (Аддендум №1, §7, вариант А) ----------------------

export const s3Env = lazy('s3', () =>
  z
    .object({
      S3_ENDPOINT: z.string().url(),
      S3_REGION: z.string().min(1),
      S3_BUCKET: z.string().min(1),
      S3_ACCESS_KEY_ID: z.string().min(1),
      S3_SECRET_ACCESS_KEY: z.string().min(1),
      S3_FORCE_PATH_STYLE: bool,
    })
    .parse({
      S3_ENDPOINT: process.env.S3_ENDPOINT,
      S3_REGION: process.env.S3_REGION,
      S3_BUCKET: process.env.S3_BUCKET,
      S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
      S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
      S3_FORCE_PATH_STYLE: process.env.S3_FORCE_PATH_STYLE,
    }),
);

// --- Курсы валют ------------------------------------------------------------

export const fxEnv = lazy('fx', () =>
  z
    .object({
      FX_PROVIDER: z.enum(['cbr', 'ecb', 'openexchangerates']).default('cbr'),
      FX_API_BASE_URL: z.string().optional(),
      FX_API_KEY: z.string().optional(),
    })
    .parse({
      FX_PROVIDER: process.env.FX_PROVIDER,
      FX_API_BASE_URL: process.env.FX_API_BASE_URL,
      FX_API_KEY: process.env.FX_API_KEY,
    }),
);

// --- Email через Resend (OTP-коды) -----------------------------------------

export const resendEnv = lazy('resend', () =>
  z
    .object({
      RESEND_API_KEY: z.string().min(1),
      EMAIL_FROM: z.string().min(1).default('Holdy <onboarding@resend.dev>'),
    })
    .parse({
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      EMAIL_FROM: process.env.EMAIL_FROM,
    }),
);

// --- Платежи (Platecha) -----------------------------------------------------

export const paymentsEnv = lazy('payments', () =>
  z
    .object({
      PLATECHA_API_URL: z.string().url(),
      PLATECHA_API_KEY: z.string().min(1),
      PLATECHA_SECRET: z.string().min(1),
      PLATECHA_WEBHOOK_SECRET: z.string().min(1),
    })
    .parse({
      PLATECHA_API_URL: process.env.PLATECHA_API_URL,
      PLATECHA_API_KEY: process.env.PLATECHA_API_KEY,
      PLATECHA_SECRET: process.env.PLATECHA_SECRET,
      PLATECHA_WEBHOOK_SECRET: process.env.PLATECHA_WEBHOOK_SECRET,
    }),
);

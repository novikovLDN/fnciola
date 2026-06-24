/**
 * Схема БД (Drizzle ORM, PostgreSQL) — §7 ТЗ.
 *
 * Принципы:
 *  - Денежные суммы — bigint в минорных единицах валюты (никаких float).
 *  - Все таблицы пользовательских данных содержат user_id (изоляция, §6).
 *  - Курсы валют — decimal (это коэффициент, не деньги).
 */

import {
  pgTable,
  text,
  uuid,
  bigint,
  integer,
  boolean,
  timestamp,
  date,
  numeric,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

// --- Перечисления ----------------------------------------------------------

export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'pro']);
export const accountTypeEnum = pgEnum('account_type', ['cash', 'card', 'bank', 'other']);
export const categoryKindEnum = pgEnum('category_kind', ['income', 'expense']);
export const directionEnum = pgEnum('direction', ['income', 'expense']);
export const txSourceEnum = pgEnum('tx_source', ['manual', 'import']);
export const importFormatEnum = pgEnum('import_format', ['csv', 'xlsx', 'ofx', 'mt940', 'camt053', 'pdf']);
export const importStatusEnum = pgEnum('import_status', ['pending', 'parsing', 'needs_review', 'done', 'failed']);
export const otpPurposeEnum = pgEnum('otp_purpose', ['register', 'login', 'recovery']);
export const entryKindEnum = pgEnum('entry_kind', ['income', 'expense']);
export const expenseGroupEnum = pgEnum('expense_group', ['cogs', 'opex', 'taxes', 'interest', 'depreciation']);
export const recurrenceEnum = pgEnum('recurrence', ['one_time', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly']);
export const planEnum = pgEnum('plan', ['m1', 'm3', 'm6', 'm12']);
export const subStatusEnum = pgEnum('sub_status', ['active', 'canceled', 'past_due', 'expired']);

// --- users -----------------------------------------------------------------

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
  passwordHash: text('password_hash'), // nullable, если вход только по passkey
  displayCurrency: text('display_currency').notNull().default('RUB'), // ISO 4217
  subscriptionTier: subscriptionTierEnum('subscription_tier').notNull().default('free'),
  subscriptionStatus: text('subscription_status'),
  subscriptionUntil: timestamp('subscription_until', { withTimezone: true }),
  locale: text('locale').notNull().default('ru'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// --- auth_passkeys (WebAuthn) ----------------------------------------------

export const authPasskeys = pgTable('auth_passkeys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  credentialId: text('credential_id').notNull().unique(),
  publicKey: text('public_key').notNull(),
  counter: bigint('counter', { mode: 'number' }).notNull().default(0),
  transports: text('transports'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
});

// --- auth_email_codes (OTP) ------------------------------------------------

export const authEmailCodes = pgTable('auth_email_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }), // nullable до регистрации
  email: text('email').notNull(),
  codeHash: text('code_hash').notNull(),
  purpose: otpPurposeEnum('purpose').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  consumedAt: timestamp('consumed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  emailIdx: index('auth_email_codes_email_idx').on(t.email),
}));

// --- accounts --------------------------------------------------------------

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  currency: text('currency').notNull(), // ISO 4217
  type: accountTypeEnum('type').notNull().default('card'),
  archived: boolean('archived').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  userIdx: index('accounts_user_idx').on(t.userId),
}));

// --- categories ------------------------------------------------------------

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kind: categoryKindEnum('kind').notNull(),
  name: text('name').notNull(),
  parentId: uuid('parent_id'),
  icon: text('icon'),
  color: text('color'),
  isSystem: boolean('is_system').notNull().default(false),
}, (t) => ({
  userIdx: index('categories_user_idx').on(t.userId),
}));

// --- transactions ----------------------------------------------------------

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  direction: directionEnum('direction').notNull(),
  // Оригинальные сумма/валюта — никогда не теряются (§8).
  amountOriginal: bigint('amount_original', { mode: 'number' }).notNull(),
  currencyOriginal: text('currency_original').notNull(),
  // Пересчёт в валюту отображения по курсу на дату операции (§8).
  amountDisplay: bigint('amount_display', { mode: 'number' }).notNull(),
  fxRateUsed: numeric('fx_rate_used', { precision: 20, scale: 10 }),
  fxRateDate: date('fx_rate_date'),
  occurredAt: date('occurred_at').notNull(),
  description: text('description'),
  merchantRaw: text('merchant_raw'),
  merchantNormalized: text('merchant_normalized'),
  source: txSourceEnum('source').notNull().default('manual'),
  importBatchId: uuid('import_batch_id'),
  externalHash: text('external_hash'), // для дедупликации импорта
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  userOccurredIdx: index('transactions_user_occurred_idx').on(t.userId, t.occurredAt),
  accountIdx: index('transactions_account_idx').on(t.accountId),
  // Дедуп: один и тот же external_hash в рамках пользователя — уникален.
  dedupIdx: uniqueIndex('transactions_dedup_idx').on(t.userId, t.externalHash),
}));

// --- import_batches --------------------------------------------------------

export const importBatches = pgTable('import_batches', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  format: importFormatEnum('format').notNull(),
  status: importStatusEnum('status').notNull().default('pending'),
  isBeta: boolean('is_beta').notNull().default(false), // true для PDF
  rowsTotal: integer('rows_total').notNull().default(0),
  rowsImported: integer('rows_imported').notNull().default(0),
  rowsDuplicated: integer('rows_duplicated').notNull().default(0),
  error: text('error'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  userIdx: index('import_batches_user_idx').on(t.userId),
}));

// --- fx_rates --------------------------------------------------------------

export const fxRates = pgTable('fx_rates', {
  id: uuid('id').primaryKey().defaultRandom(),
  base: text('base').notNull(), // ISO 4217
  quote: text('quote').notNull(), // ISO 4217
  rate: numeric('rate', { precision: 20, scale: 10 }).notNull(),
  rateDate: date('rate_date').notNull(),
}, (t) => ({
  uniqIdx: uniqueIndex('fx_rates_uniq_idx').on(t.base, t.quote, t.rateDate),
}));

// --- projects --------------------------------------------------------------

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  currency: text('currency').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  userIdx: index('projects_user_idx').on(t.userId),
}));

// --- project_entries -------------------------------------------------------

export const projectEntries = pgTable('project_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kind: entryKindEnum('kind').notNull(),
  expenseGroup: expenseGroupEnum('expense_group'), // только для расходов
  subcategory: text('subcategory'),
  amount: bigint('amount', { mode: 'number' }).notNull(), // минорные единицы
  currency: text('currency').notNull(),
  recurrence: recurrenceEnum('recurrence').notNull().default('one_time'),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  projectIdx: index('project_entries_project_idx').on(t.projectId),
}));

// --- sessions (вход по cookie) ---------------------------------------------

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  userIdx: index('sessions_user_idx').on(t.userId),
}));

// --- user_ledger (все данные пользователя, JSON-снимок) --------------------

export const userLedger = pgTable('user_ledger', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  data: jsonb('data').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// --- push_subscriptions ----------------------------------------------------

export const pushSubscriptions = pgTable('push_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  endpoint: text('endpoint').notNull(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  platform: text('platform'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
}, (t) => ({
  endpointIdx: uniqueIndex('push_subscriptions_endpoint_idx').on(t.endpoint),
}));

// --- subscriptions (платные) -----------------------------------------------

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  plan: planEnum('plan').notNull(),
  provider: text('provider').notNull().default('platecha'),
  providerSubscriptionId: text('provider_subscription_id'),
  status: subStatusEnum('status').notNull().default('active'),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  autoRenew: boolean('auto_renew').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  userIdx: index('subscriptions_user_idx').on(t.userId),
}));

// --- audit_log -------------------------------------------------------------

export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  meta: jsonb('meta'),
  ip: text('ip'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  userIdx: index('audit_log_user_idx').on(t.userId),
}));

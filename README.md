# Holdy

Финансовое веб-приложение (PWA) для учёта **личных финансов** и **бизнес-метрик**.
Реализация по ТЗ «Техническое задание: финансовое веб-приложение (PWA)» v1.0
и Аддендуму №1 (деплой на Railway).

> Продукт МХОЛД. Основной язык интерфейса — русский (i18n с первого дня).

## Стек (§4 ТЗ)

- **Next.js (App Router) + TypeScript** — лендинг (SSR/SEO) и кабинет в одном проекте
- **Tailwind CSS** — дизайн-токены из §14 (палитра «Navy + Digital Lavender»)
- **Apache ECharts** — графики
- **PostgreSQL + Drizzle ORM** — хранилище и миграции
- **BullMQ + Redis** — фоновые задачи (worker)
- **Better Auth** (планируется к подключению) — email-OTP, пароли, passkeys
- **Platecha** — рекуррентные подписки
- **Railway** — хостинг (web + worker + Postgres + Redis), см. Аддендум №1

## Структура

```
src/
  app/                     # Next.js App Router
    (auth)/                # §11: регистрация / вход / восстановление
    app/                   # личный кабинет (§15.2)
      page.tsx             #   дашборд
      transactions/        #   операции
      accounts/            #   счета
      import/              #   импорт выписок (§9)
      projects/            #   бизнес-метрики «Мой проект» (§10)
      settings/            #   профиль, валюта, passkeys, подписка, уведомления
    api/
      health/              # /api/health — healthcheck (Аддендум №1, §6)
      projects/[id]/metrics/  # GET метрик за период (§16)
      push/subscribe/      # web-push (§13)
      webhooks/platecha/   # вебхуки платежей (§12)
    page.tsx               # лендинг (§15.1)
  components/              # Logo, навигация кабинета, ECharts, Money
  config/plans.ts          # тарифы Premium (§12)
  db/                      # Drizzle: schema (§7) + пул соединений (Аддендум §2)
  i18n/ru.ts               # словарь локали (§17)
  lib/
    money.ts               # ★ целочисленная денежная арифметика (§5.2)
    currencies.ts          # справочник валют ISO 4217
    fx.ts                  # ★ пересчёт по курсу на дату операции (§8)
    metrics.ts             # ★ управленческие метрики и развёртка повторов (§10)
    gating.ts              # ★ инфраструктура Free/Pro: canUse() (§3)
    import/                # ★ парсер CSV, дедуп, категоризация (§9)
    password.ts            # проверка стойкости пароля (§11)
    env.ts                 # ★ типизированный доступ к env + zod (Аддендум §3)
  worker/                  # BullMQ worker: очереди и процессоры
```

★ — доменная логика, критичная к корректности; покрыта unit-тестами.

## Принципы корректности (§5.2, §18)

- **Деньги — только целые числа** в минорных единицах (копейки/центы); никаких `float`.
- **FX** — пересчёт по курсу на дату операции; при отсутствии — ближайший предыдущий,
  использованный курс фиксируется.
- **Метрики** — стандартные управленческие формулы; защита от деления на ноль (маржа = «—»).
- **Импорт** — дедупликация по `external_hash`; сырой файл удаляется после обработки (§6).
- **Изоляция данных** — все запросы фильтруются по `user_id`.

## Разработка

```bash
npm install
cp .env.example .env.local   # заполнить значения
npm run dev                  # http://localhost:3000  (кабинет: /app)

npm test                     # unit-тесты доменной логики (45 шт.)
npm run typecheck            # проверка типов
npm run build                # production-сборка
```

### База данных

```bash
npm run db:generate          # сгенерировать миграции из схемы
npm run db:migrate           # применить миграции
```

## Деплой на Railway (Аддендум №1)

Два сервиса из одного репозитория, различаются start-командой:

- **web**: `next start -p ${PORT}` (`railway.json`), Pre-Deploy: `npm run db:migrate`,
  healthcheck `/api/health`.
- **worker**: `npm run worker` (`railway.worker.json`), без HTTP-порта.

`DATABASE_URL` и `REDIS_URL` подключаются reference-переменными Railway
(`${{Postgres.DATABASE_URL}}`, `${{Redis.REDIS_URL}}`) по приватной сети.
Все секреты/адреса — только через `env`; в репозитории — `.env.example`,
валидация при старте (`src/lib/env.ts`).

> **Важно для деплоя:** добавьте сервису `web` переменную
> `DATABASE_URL=${{Postgres.DATABASE_URL}}` (и `REDIS_URL=${{Redis.REDIS_URL}}`).
> Без неё Pre-Deploy миграция (`npm run db:migrate`) завершится с понятной
> ошибкой — раннер (`src/db/migrate.ts`) не использует localhost-фолбэк в проде.

## Статус

MVP-каркас: реализованы доменное ядро (с тестами), дизайн-система, лендинг,
кабинет с демо-данными, схема БД, API-контракты, инфраструктура worker и деплоя.
Точки интеграции с внешними сервисами (Better Auth, S3, SMTP, провайдер курсов,
Platecha, web-push) обозначены и подготовлены к подключению через `env`.

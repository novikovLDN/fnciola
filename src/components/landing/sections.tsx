'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reveal } from '@/components/visual/Reveal';
import { TiltCard } from '@/components/visual/TiltCard';
import { CountUp } from '@/components/visual/CountUp';
import { Logo } from '@/components/Logo';
import { PLANS, pricePerMonthMinor, CURRENCY_PLANS } from '@/config/plans';
import { formatMoney } from '@/lib/money';

const ease = [0.22, 1, 0.36, 1] as const;

// --- Бегущая строка-маркер доверия ----------------------------------------

export function Marquee() {
  const items = ['Личные финансы', 'Бизнес-метрики', 'Импорт выписок', 'Мультивалюта', 'EBITDA & Runway', 'Cash Flow', 'PWA на iOS/Android'];
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-ink/8 py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bg to-transparent" />
      <motion.div
        className="flex w-max gap-10 whitespace-nowrap pr-10 text-sm text-muted"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      >
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-violet" />
            {t}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// --- Полоса ценностей (в духе platacard.mx) --------------------------------

const STRIP = [
  { h: 'Без абонплаты', t: 'Весь функционал бесплатный на старте' },
  { h: '14 валют', t: 'Учёт по курсу на дату операции' },
  { h: '8 метрик', t: 'EBITDA, cash flow, burn rate, runway' },
  { h: 'Импорт за секунды', t: 'CSV, OFX, MT940, CAMT.053' },
];

export function FeatureStrip() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
        {STRIP.map((s, i) => (
          <Reveal key={s.h} delay={i * 0.06}>
            <div className="font-display text-lg font-extrabold tracking-tight">{s.h}</div>
            <p className="mt-1.5 text-sm text-muted">{s.t}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// --- Возможности (bento + tilt) -------------------------------------------

const FEATURES = [
  { icon: '◈', title: 'Личные финансы', text: 'Доходы и расходы, счета и категории, наглядная аналитика и умные инсайты.', span: 'lg:col-span-2' },
  { icon: '⬡', title: 'Бизнес-метрики', text: 'Выручка, валовая прибыль, EBIT, EBITDA, cash flow, burn rate и runway.', span: '' },
  { icon: '◇', title: 'Импорт выписок', text: 'CSV, XLSX, OFX, MT940, CAMT.053. Дедупликация из коробки. PDF — в бете.', span: '' },
  { icon: '✦', title: 'Мультивалюта', text: 'Оригинальная валюта сохраняется и сводится по курсу на дату операции.', span: 'lg:col-span-2' },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-24">
      <Reveal>
        <span className="badge">Возможности</span>
        <h2 className="mt-5 max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Всё, что нужно — <span className="text-gradient">в одном месте</span>
        </h2>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.08} className={f.span}>
            <TiltCard className="h-full">
              <div className="card card-hover h-full">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-grad-brand text-xl text-white shadow-glow">
                  {f.icon}
                </div>
                <h3 className="font-display text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-muted">{f.text}</p>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// --- Полоса метрик с count-up ---------------------------------------------

export function MetricsBand() {
  const stats = [
    { to: 7, suffix: ' форматов', label: 'импорта выписок', fmt: (v: number) => Math.round(v).toString() },
    { to: 14, suffix: ' валют', label: 'мультивалютность', fmt: (v: number) => Math.round(v).toString() },
    { to: 8, suffix: ' метрик', label: 'управленческого учёта', fmt: (v: number) => Math.round(v).toString() },
    { to: 100, suffix: '%', label: 'целочисленная точность', fmt: (v: number) => Math.round(v).toString() },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <div className="card ring-gradient grid grid-cols-2 gap-6 sm:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="text-center">
            <div className="font-display text-4xl font-bold text-gradient">
              <CountUp to={s.to} format={(v) => `${s.fmt(v)}${s.suffix}`} />
            </div>
            <div className="mt-1 text-sm text-muted">{s.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// --- Тарифы ----------------------------------------------------------------

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-5 py-24">
      <Reveal className="text-center">
        <span className="badge">Тарифы</span>
        <h2 className="mx-auto mt-5 max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Премиум по цене кофе
        </h2>
        <p className="mx-auto mt-4 max-w-md text-muted">На старте весь функционал бесплатный. Подписку можно подключить позже.</p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan, i) => (
          <Reveal key={plan.id} delay={i * 0.07}>
            <div className={`card card-hover relative h-full ${plan.popular ? 'ring-gradient' : ''}`}>
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-grad-brand px-3 py-1 text-xs font-semibold text-white shadow-glow">
                  Выгодный
                </span>
              )}
              <div className="text-sm text-muted">{plan.title}</div>
              <div className="mt-2 font-display text-3xl font-bold">{formatMoney(plan.priceMinor, CURRENCY_PLANS)}</div>
              <div className="mt-1 text-sm text-muted">{formatMoney(pricePerMonthMinor(plan), CURRENCY_PLANS)} / мес</div>
              {plan.discountPct > 0 && (
                <div className="mt-4 inline-flex rounded-full bg-positive/15 px-3 py-1 text-xs font-medium text-positive">
                  выгода {plan.discountPct}%
                </div>
              )}
              <Link href="/register" className="btn btn-glass mt-6 w-full">Выбрать</Link>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// --- FAQ (аккордеон) -------------------------------------------------------

const FAQS = [
  { q: 'Это правда бесплатно?', a: 'На этапе MVP весь функционал бесплатный. Позже появится Premium-подписка, но базовые сценарии останутся доступны.' },
  { q: 'Как работает мультивалютность?', a: 'Каждая операция хранит оригинальную валюту и сумму. Для отчётов всё сводится в выбранную валюту отображения по курсу на дату операции.' },
  { q: 'Мои данные в безопасности?', a: 'Только HTTPS, изоляция данных по пользователю, шифрование на сервере. Сырые файлы выписок удаляются после обработки.' },
  { q: 'Работают ли уведомления на iPhone?', a: 'Да, но только после установки Holdy на главный экран — это ограничение iOS, не баг. Мы подскажем, как установить.' },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-24">
      <Reveal className="text-center">
        <span className="badge">Вопросы</span>
        <h2 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">Частые вопросы</h2>
      </Reveal>
      <div className="mt-10 space-y-3">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={f.q} delay={i * 0.05}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="card w-full text-left transition-colors"
                aria-expanded={isOpen}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium">{f.q}</span>
                  <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.3 }} className="text-violet text-xl">
                    +
                  </motion.span>
                </div>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.p
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      transition={{ duration: 0.35, ease }}
                      className="overflow-hidden text-sm text-muted"
                    >
                      {f.a}
                    </motion.p>
                  )}
                </AnimatePresence>
              </button>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

// --- Финальный CTA ---------------------------------------------------------

export function CtaBand() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <Reveal>
        <div className="card ring-gradient relative overflow-hidden px-6 py-16 text-center sm:px-12">
          <div aria-hidden className="absolute inset-0 -z-10 opacity-60" style={{ background: 'radial-gradient(60% 80% at 50% 0%, rgba(242,78,30,0.28), transparent 70%)' }} />
          <h2 className="mx-auto max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Возьмите финансы под контроль <span className="text-gradient">сегодня</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted">Регистрация за минуту. Без карты. Весь функционал на старте бесплатный.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn btn-primary px-8 py-3 text-base">Создать аккаунт →</Link>
            <Link href="/app" className="btn btn-glass px-8 py-3 text-base">Открыть демо</Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// --- Футер -----------------------------------------------------------------

export function Footer() {
  return (
    <footer className="border-t border-ink/8 px-5 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 sm:flex-row">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">
            Технологичный учёт личных финансов и метрик бизнеса. Продукт МХОЛД.
          </p>
        </div>
        <nav className="flex gap-12 text-sm">
          <div className="flex flex-col gap-2">
            <span className="label mb-1">Продукт</span>
            <a href="#features" className="text-muted hover:text-ink">Возможности</a>
            <a href="#pricing" className="text-muted hover:text-ink">Тарифы</a>
            <Link href="/app" className="text-muted hover:text-ink">Демо</Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="label mb-1">Аккаунт</span>
            <Link href="/login" className="text-muted hover:text-ink">Войти</Link>
            <Link href="/register" className="text-muted hover:text-ink">Регистрация</Link>
          </div>
        </nav>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-ink/8 pt-6 text-center text-xs text-muted">
        © {new Date().getFullYear()} МХОЛД · Holdy
      </div>
    </footer>
  );
}

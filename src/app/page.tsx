import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { PLANS, pricePerMonthMinor, CURRENCY_PLANS } from '@/config/plans';
import { formatMoney } from '@/lib/money';

/** Лендинг (SSR/SEO), §15.1. Выразительный, крупный, смелый (§14.3). */
export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <Hero />
        <ValueBlocks />
        <ChartsDemo />
        <Pricing />
        <Faq />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-bg/80 border-b border-black/5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href="/login" className="btn-ghost">Войти</Link>
          <Link href="/register" className="btn-primary">Начать</Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* мягкий mesh-градиент с violet (§14.3) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            'radial-gradient(60% 50% at 20% 10%, rgba(108,77,245,0.18), transparent 60%), radial-gradient(50% 50% at 90% 20%, rgba(233,230,251,0.9), transparent 60%)',
        }}
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
        <span className="badge mb-6">Финансы и бизнес-метрики в одном месте</span>
        <h1 className="font-display text-4xl sm:text-6xl leading-[1.05] tracking-tight max-w-3xl">
          Деньги под контролем — <span className="text-accent">личные и бизнеса</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-ink/70 max-w-2xl">
          Учёт доходов и расходов, аналитика и инсайты, импорт банковских выписок и мультивалютность.
          А для своего проекта — выручка, EBITDA, денежный поток и runway.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register" className="btn-accent text-base px-7 py-3">Начать бесплатно</Link>
          <Link href="/login" className="btn-soft text-base px-7 py-3">У меня уже есть аккаунт</Link>
        </div>
        <p className="mt-4 text-sm text-ink/50">Весь функционал на старте бесплатный. Устанавливается как приложение (PWA).</p>
      </div>
    </section>
  );
}

const VALUES = [
  { title: 'Личные финансы', text: 'Доходы и расходы, счета и категории, наглядная аналитика и инсайты.', icon: '💸' },
  { title: 'Бизнес-метрики', text: 'Заведите проект — Holdy посчитает выручку, прибыль, EBITDA, cash flow и burn rate.', icon: '📈' },
  { title: 'Импорт выписок', text: 'CSV, XLSX, OFX, MT940, CAMT.053. PDF — в бета-режиме. Дедупликация из коробки.', icon: '🗂️' },
  { title: 'Мультивалюта', text: 'Любая валюта операции сохраняется в оригинале и сводится по курсу на дату.', icon: '🌍' },
];

function ValueBlocks() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <h2 className="font-display text-2xl sm:text-3xl mb-8">Что умеет Holdy</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {VALUES.map((v) => (
          <div key={v.title} className="bento">
            <div className="text-3xl mb-3" aria-hidden>{v.icon}</div>
            <h3 className="font-display text-lg mb-2">{v.title}</h3>
            <p className="text-sm text-ink/70">{v.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ChartsDemo() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <div className="bento bg-gradient-to-br from-surface to-accent-soft/40">
        <div className="grid lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-1">
            <h2 className="font-display text-2xl sm:text-3xl mb-3">Цифры, которые видно</h2>
            <p className="text-ink/70">
              Крупные «живые» метрики, плавные графики динамики и структуры расходов. Читаемость данных важнее декора.
            </p>
          </div>
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <MiniMetric label="Баланс" value={formatMoney(48230000, 'RUB')} />
            <MiniMetric label="Доход" value={formatMoney(12500000, 'RUB')} positive />
            <MiniMetric label="EBITDA" value={formatMoney(4500000, 'RUB')} positive />
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniMetric({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="rounded-bento bg-surface p-4 shadow-bento">
      <div className="text-xs text-ink/50 mb-1">{label}</div>
      <div className={`metric-value text-2xl ${positive ? 'text-positive' : ''}`}>{value}</div>
    </div>
  );
}

function Pricing() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-2">
        <h2 className="font-display text-2xl sm:text-3xl">Тарифы</h2>
        <p className="text-sm text-ink/60">На MVP всё бесплатно. Premium можно подключить позже.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => (
          <div key={plan.id} className={`bento relative ${plan.popular ? 'ring-2 ring-accent' : ''}`}>
            {plan.popular && <span className="badge absolute -top-3 left-5">Популярный</span>}
            <div className="font-display text-lg mb-1">{plan.title}</div>
            <div className="metric-value text-2xl mb-1">{formatMoney(plan.priceMinor, CURRENCY_PLANS)}</div>
            <div className="text-sm text-ink/60">
              {formatMoney(pricePerMonthMinor(plan), CURRENCY_PLANS)} / мес.
            </div>
            {plan.discountPct > 0 && <div className="badge mt-3 bg-positive/15 text-positive">−{plan.discountPct}%</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

const FAQS = [
  { q: 'Это правда бесплатно?', a: 'На этапе MVP весь функционал бесплатный. Позже появится Premium-подписка, но базовые сценарии останутся доступны.' },
  { q: 'Как устроена мультивалютность?', a: 'Каждая операция хранит оригинальную валюту и сумму. Для отчётов всё сводится в выбранную валюту отображения по курсу на дату операции.' },
  { q: 'Безопасны ли мои данные?', a: 'Только HTTPS, изоляция данных по пользователю, шифрование на сервере. Сырые файлы выписок удаляются после обработки.' },
  { q: 'Работают ли уведомления на iPhone?', a: 'Да, но только если установить Holdy на главный экран (ограничение iOS). Мы подскажем, как это сделать.' },
];

function Faq() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <h2 className="font-display text-2xl sm:text-3xl mb-8">Частые вопросы</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {FAQS.map((f) => (
          <div key={f.q} className="bento">
            <h3 className="font-medium mb-2">{f.q}</h3>
            <p className="text-sm text-ink/70">{f.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-ink text-white/80 mt-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 flex flex-col sm:flex-row justify-between gap-6">
        <div>
          <Logo variant="badge" />
          <p className="mt-4 text-sm text-white/60 max-w-sm">
            Holdy — финансовое приложение для личных финансов и бизнес-метрик. Продукт МХОЛД.
          </p>
        </div>
        <nav className="flex flex-col gap-2 text-sm">
          <Link href="/login" className="hover:text-white">Войти</Link>
          <Link href="/register" className="hover:text-white">Регистрация</Link>
          <Link href="/app" className="hover:text-white">Демо-кабинет</Link>
        </nav>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} МХОЛД · Holdy
      </div>
    </footer>
  );
}

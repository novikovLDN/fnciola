import { Nav } from '@/components/landing/Nav';
import { Hero } from '@/components/landing/Hero';
import { DashboardPreview } from '@/components/landing/DashboardPreview';
import { Reveal } from '@/components/visual/Reveal';
import { Marquee, FeatureStrip, Features, MetricsBand, Pricing, Faq, CtaBand, Footer } from '@/components/landing/sections';

/** Лендинг Holdy — технологичный, тёмно-премиальный, полностью анимированный (§15.1). */
export default function LandingPage() {
  return (
    <div className="relative">
      <Nav />
      <main>
        <Hero />
        <FeatureStrip />
        <Marquee />

        {/* Превью живого дашборда */}
        <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 py-24 lg:grid-cols-2">
          <Reveal>
            <span className="badge">Аналитика</span>
            <h2 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Данные, которые <span className="text-gradient">видно и приятно</span>
            </h2>
            <p className="mt-5 max-w-md text-muted">
              Крупные «живые» цифры, плавные графики динамики и структуры расходов.
              Прибыль и убыток различимы не только цветом — иконкой и знаком.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {['Реальное время и пересчёт в вашу валюту', 'Управленческие метрики бизнеса', 'Инсайты и сравнение период-к-периоду'].map((t) => (
                <li key={t} className="flex items-center gap-3 text-muted">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-grad-brand text-[10px] text-white">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
          <DashboardPreview />
        </section>

        <Features />
        <MetricsBand />
        <Pricing />
        <Faq />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}

'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Aurora } from '@/components/visual/Aurora';

// Реальная 3D-сцена — только на клиенте (WebGL).
const Hero3D = dynamic(() => import('@/components/visual/Hero3D').then((m) => m.Hero3D), { ssr: false });

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yText = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -80]);
  const yArt = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden pt-28 pb-20">
      <Aurora />

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 lg:grid-cols-2">
        <motion.div style={{ y: yText, opacity }}>
          <motion.span
            className="badge"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-glow" />
            Новый стандарт финансов
          </motion.span>

          <motion.h1
            className="mt-6 font-display text-[clamp(2.6rem,4vw+1rem,4.6rem)] font-bold leading-[1.02] tracking-tight"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.05 }}
          >
            Деньги под
            <br />
            <span className="text-gradient">полным контролем</span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-md text-lg text-muted"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.15 }}
          >
            Личные финансы и метрики бизнеса в одном технологичном пространстве.
            Аналитика, импорт выписок, мультивалюта, EBITDA и runway — в реальном времени.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.25 }}
          >
            <Link href="/register" className="btn btn-primary px-7 py-3 text-base">Начать бесплатно →</Link>
            <Link href="/app" className="btn btn-glass px-7 py-3 text-base">Смотреть демо</Link>
          </motion.div>

          <motion.div
            className="mt-8 flex items-center gap-6 text-sm text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <span>● Бесплатно на старте</span>
            <span>● Устанавливается как приложение</span>
          </motion.div>
        </motion.div>

        {/* 3D-арт */}
        <motion.div style={{ y: yArt }} className="relative h-[360px] sm:h-[460px] lg:h-[560px]">
          <Hero3D className="absolute inset-0" />
          {/* Парящие стеклянные чипы поверх 3D */}
          <FloatingChip className="left-2 top-10" delay={0.6} label="Баланс" value="₽ 4,82 млн" />
          <FloatingChip className="right-0 top-1/3" delay={0.8} label="EBITDA" value="+ ₽ 450К" accent />
          <FloatingChip className="left-6 bottom-10" delay={1} label="Runway" value="18 мес" />
        </motion.div>
      </div>

      {/* Индикатор скролла */}
      {!reduce && (
        <motion.div
          className="absolute bottom-7 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div className="flex h-9 w-5 items-start justify-center rounded-full border border-white/15 p-1">
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-white/70"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      )}
    </section>
  );
}

function FloatingChip({
  className = '',
  label,
  value,
  accent,
  delay = 0,
}: {
  className?: string;
  label: string;
  value: string;
  accent?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      className={`glass absolute flex flex-col gap-0.5 rounded-2xl px-4 py-3 ${className}`}
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease }}
    >
      <span className="text-[10px] uppercase tracking-wider text-muted">{label}</span>
      <span className={`font-display text-sm font-semibold tnum ${accent ? 'text-positive' : ''}`}>{value}</span>
    </motion.div>
  );
}

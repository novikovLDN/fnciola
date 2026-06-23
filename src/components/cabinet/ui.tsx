'use client';

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;

/** Контейнер со ступенчатым появлением дочерних <Item>. */
export function Stagger({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : 'hidden'}
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: delay } } }}
    >
      {children}
    </motion.div>
  );
}

export function Item({ children, className, ...rest }: { children: React.ReactNode } & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Шапка экрана кабинета. */
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.header
      initial={reduce ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="mb-6 flex flex-wrap items-end justify-between gap-3"
    >
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </motion.header>
  );
}

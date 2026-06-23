'use client';

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';

/** Появление при скролле (spring), с уважением к prefers-reduced-motion. */
export function Reveal({
  children,
  delay = 0,
  y = 20,
  className,
  ...rest
}: { children: React.ReactNode; delay?: number; y?: number } & HTMLMotionProps<'div'>) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

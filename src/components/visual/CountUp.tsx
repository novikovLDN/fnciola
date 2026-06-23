'use client';

import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

/**
 * Анимированный счётчик чисел (count-up) при попадании в зону видимости.
 * `format` получает текущее значение и возвращает строку (валюта/проценты).
 */
export function CountUp({
  to,
  format,
  className = '',
  durationStiffness = 60,
}: {
  to: number;
  format: (v: number) => string;
  className?: string;
  durationStiffness?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: durationStiffness, damping: 20 });

  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, to, mv]);

  useEffect(() => {
    if (reduce) {
      if (ref.current) ref.current.textContent = format(to);
      return;
    }
    return spring.on('change', (v) => {
      if (ref.current) ref.current.textContent = format(v);
    });
  }, [spring, format, reduce, to]);

  return <span ref={ref} className={`tnum ${className}`}>{format(reduce ? to : 0)}</span>;
}

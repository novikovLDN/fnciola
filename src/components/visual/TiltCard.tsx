'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';

/**
 * «Жидкое стекло»: карточка с 3D-наклоном к курсору и бликом-спотлайтом,
 * который следует за указателем. Премиальная микро-интеракция.
 */
export function TiltCard({
  children,
  className = '',
  glow = true,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [7, -7]), { stiffness: 150, damping: 18 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-7, 7]), { stiffness: 150, damping: 18 });
  const sheenX = useTransform(px, [0, 1], ['0%', '100%']);
  const sheenY = useTransform(py, [0, 1], ['0%', '100%']);

  function onMove(e: React.PointerEvent) {
    if (reduce) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }
  function onLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={reduce ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d', transformPerspective: 900 }}
      className={`group relative ${className}`}
    >
      {children}
      {glow && !reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: useTransform(
              [sheenX, sheenY],
              ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgb(124 92 255 / 0.22), transparent 60%)`,
            ),
          }}
        />
      )}
    </motion.div>
  );
}

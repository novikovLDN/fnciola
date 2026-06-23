'use client';

import { useEffect, useRef } from 'react';

/**
 * Живой фон всего приложения: дрейфующее «созвездие» светящихся узлов с
 * соединительными линиями + медленный параллакс от курсора. Кастомный canvas,
 * без зависимостей. При prefers-reduced-motion рисует один статичный кадр.
 */
export function LiveBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = ref.current;
    if (!canvasEl) return;
    const context = canvasEl.getContext('2d');
    if (!context) return;
    // Явные non-null типы, чтобы сужение сохранялось во вложенных функциях.
    const cv: HTMLCanvasElement = canvasEl;
    const g: CanvasRenderingContext2D = context;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;

    type P = { x: number; y: number; vx: number; vy: number; r: number; hue: number };
    let points: P[] = [];

    const COLORS = [
      [124, 92, 255], // violet
      [61, 214, 245], // cyan
      [255, 77, 141], // magenta
    ];

    function resize() {
      w = cv.clientWidth;
      h = cv.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = w * dpr;
      cv.height = h * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);

      const density = Math.min(90, Math.floor((w * h) / 22000));
      points = Array.from({ length: density }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.8 + 0.6,
        hue: Math.floor(Math.random() * COLORS.length),
      }));
    }

    const mouse = { x: -9999, y: -9999 };
    const onMove = (e: PointerEvent) => {
      const rect = cv.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    function draw() {
      g.clearRect(0, 0, w, h);

      // Линии-связи
      for (let i = 0; i < points.length; i++) {
        const a = points[i];
        for (let j = i + 1; j < points.length; j++) {
          const b = points[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.18;
            const c = COLORS[a.hue];
            g.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
            g.lineWidth = 1;
            g.beginPath();
            g.moveTo(a.x, a.y);
            g.lineTo(b.x, b.y);
            g.stroke();
          }
        }
      }

      // Узлы со свечением
      for (const p of points) {
        const c = COLORS[p.hue];
        // притяжение/отталкивание от курсора
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const md = Math.hypot(dx, dy);
        if (md < 160) {
          p.x += (dx / md) * 0.4;
          p.y += (dy / md) * 0.4;
        }
        g.shadowBlur = 12;
        g.shadowColor = `rgba(${c[0]},${c[1]},${c[2]},0.8)`;
        g.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.9)`;
        g.beginPath();
        g.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        g.fill();
        g.shadowBlur = 0;

        if (!reduce) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        }
      }
    }

    let raf = 0;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };

    resize();
    if (reduce) {
      draw();
    } else {
      loop();
      window.addEventListener('pointermove', onMove);
    }
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      {/* Базовые градиентные пятна (всегда живые) */}
      <div
        className="absolute -top-1/4 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgb(124 92 255 / 0.5), transparent 60%)', animation: 'aurora-pan 22s ease-in-out infinite' }}
      />
      <div
        className="absolute bottom-[-20rem] right-[-10rem] h-[44rem] w-[44rem] rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgb(61 214 245 / 0.45), transparent 60%)', animation: 'aurora-pan 28s ease-in-out infinite reverse' }}
      />
      <canvas ref={ref} className="h-full w-full opacity-70" />
    </div>
  );
}

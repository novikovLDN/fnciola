/**
 * Анимированный «aurora»-фон: мягкие неоновые градиентные пятна + сетка.
 * Чистый CSS (без зависимостей), уважает prefers-reduced-motion.
 */
export function Aurora({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}>
      {/* Сетка-перспектива */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'linear-gradient(rgb(255 255 255 / 0.5) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)',
        }}
      />
      {/* Цветные пятна */}
      <div
        className="absolute -top-40 -left-32 h-[44rem] w-[44rem] rounded-full blur-3xl opacity-50"
        style={{ background: 'radial-gradient(circle, rgb(124 92 255 / 0.55), transparent 60%)', animation: 'aurora-pan 16s ease-in-out infinite' }}
      />
      <div
        className="absolute top-10 right-[-10rem] h-[40rem] w-[40rem] rounded-full blur-3xl opacity-40"
        style={{ background: 'radial-gradient(circle, rgb(61 214 245 / 0.5), transparent 60%)', animation: 'aurora-pan 20s ease-in-out infinite reverse' }}
      />
      <div
        className="absolute bottom-[-16rem] left-1/3 h-[38rem] w-[38rem] rounded-full blur-3xl opacity-35"
        style={{ background: 'radial-gradient(circle, rgb(255 77 141 / 0.45), transparent 60%)', animation: 'aurora-pan 24s ease-in-out infinite' }}
      />
      {/* Виньетка снизу для плавного перехода к фону */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-bg" />
    </div>
  );
}

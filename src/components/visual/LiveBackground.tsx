/**
 * Светлый амбиентный фон: едва заметные тёплые пастельные пятна, медленно
 * дышащие. Чисто и воздушно (в духе platacard.mx), без визуального шума.
 * Чистый CSS, уважает prefers-reduced-motion.
 */
export function LiveBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -top-40 left-1/4 h-[50rem] w-[50rem] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgb(242 78 30 / 0.10), transparent 65%)', animation: 'aurora-pan 26s ease-in-out infinite' }}
      />
      <div
        className="absolute -bottom-40 right-0 h-[44rem] w-[44rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgb(255 138 76 / 0.10), transparent 65%)', animation: 'aurora-pan 32s ease-in-out infinite reverse' }}
      />
      <div
        className="absolute left-[-10rem] top-1/3 h-[36rem] w-[36rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgb(120 140 255 / 0.06), transparent 65%)', animation: 'aurora-pan 38s ease-in-out infinite' }}
      />
    </div>
  );
}

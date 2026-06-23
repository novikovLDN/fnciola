/**
 * Светлый фон-секция: едва заметная точечная сетка + тёплое сияние под 3D.
 * Чисто и воздушно (platacard.mx). Чистый CSS.
 */
export function Aurora({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}>
      {/* Точечная сетка */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: 'radial-gradient(rgb(17 17 19 / 0.06) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 60% 30%, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 60% 30%, black 20%, transparent 75%)',
        }}
      />
      {/* Тёплое сияние */}
      <div
        className="absolute right-[10%] top-[20%] h-[34rem] w-[34rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgb(242 78 30 / 0.12), transparent 60%)' }}
      />
    </div>
  );
}

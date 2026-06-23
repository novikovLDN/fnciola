/** Логотип Holdy — градиентный знак «H» + словесная марка. */
export function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const text = size === 'sm' ? 'text-base' : 'text-lg';
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <Mark />
      <span className={`font-display font-bold tracking-tight ${text}`}>
        Holdy
      </span>
    </span>
  );
}

function Mark() {
  return (
    <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-xl shadow-glow"
      style={{ background: 'linear-gradient(135deg, rgb(124 92 255), rgb(61 214 245))' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M5 4v16M19 4v16M5 12h14" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/**
 * Логотип Holdy (§14.1). Бренд МХОЛД: белый на navy.
 * `variant="badge"` — белый знак на navy-подложке (шапка/сплэш/футер).
 */
export function Logo({ variant = 'inline' }: { variant?: 'inline' | 'badge' }) {
  if (variant === 'badge') {
    return (
      <span className="inline-flex items-center gap-2 rounded-pill bg-ink px-3 py-1.5">
        <Mark className="text-white" />
        <span className="font-display text-white text-sm tracking-wide">HOLDY</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2">
      <Mark className="text-accent" />
      <span className="font-display text-lg tracking-wide">Holdy</span>
    </span>
  );
}

function Mark({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <rect x="3" y="3" width="7" height="18" rx="2.5" fill="currentColor" />
      <rect x="14" y="3" width="7" height="18" rx="2.5" fill="currentColor" />
      <rect x="3" y="9.5" width="18" height="5" rx="2.5" fill="currentColor" />
    </svg>
  );
}

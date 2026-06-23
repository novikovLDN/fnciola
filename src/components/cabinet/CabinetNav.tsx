'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { dict } from '@/i18n/ru';

const NAV = [
  { href: '/app', label: dict.nav.dashboard, icon: '📊' },
  { href: '/app/transactions', label: dict.nav.transactions, icon: '🧾' },
  { href: '/app/accounts', label: dict.nav.accounts, icon: '💳' },
  { href: '/app/import', label: dict.nav.import, icon: '🗂️' },
  { href: '/app/projects', label: dict.nav.projects, icon: '📈' },
  { href: '/app/settings', label: dict.nav.settings, icon: '⚙️' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/app') return pathname === '/app';
  return pathname.startsWith(href);
}

/** Десктоп — боковая навигация (§15.3). */
export function CabinetSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-black/5 bg-surface min-h-screen sticky top-0">
      <div className="h-16 flex items-center px-5 border-b border-black/5">
        <Link href="/app"><Logo /></Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-pill px-4 py-2.5 text-sm transition-colors ${
              isActive(pathname, item.href) ? 'bg-accent-soft text-ink font-medium' : 'text-ink/70 hover:bg-black/5'
            }`}
            aria-current={isActive(pathname, item.href) ? 'page' : undefined}
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-black/5">
        <Link href="/" className="btn-ghost w-full text-sm">{dict.nav.logout}</Link>
      </div>
    </aside>
  );
}

/** Мобайл — нижняя панель навигации (§15.3). */
export function CabinetBottomBar() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-black/5 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {NAV.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] ${
              isActive(pathname, item.href) ? 'text-accent font-medium' : 'text-ink/60'
            }`}
            aria-current={isActive(pathname, item.href) ? 'page' : undefined}
          >
            <span className="text-lg" aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

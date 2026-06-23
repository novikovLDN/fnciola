'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { dict } from '@/i18n/ru';

const NAV = [
  { href: '/app', label: dict.nav.dashboard, icon: DashIcon },
  { href: '/app/transactions', label: dict.nav.transactions, icon: ListIcon },
  { href: '/app/accounts', label: dict.nav.accounts, icon: CardIcon },
  { href: '/app/import', label: dict.nav.import, icon: ImportIcon },
  { href: '/app/projects', label: dict.nav.projects, icon: ChartIcon },
  { href: '/app/settings', label: dict.nav.settings, icon: GearIcon },
];

function active(pathname: string, href: string): boolean {
  return href === '/app' ? pathname === '/app' : pathname.startsWith(href);
}

export function CabinetSidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-ink/8 bg-bg-2/60 backdrop-blur-xl lg:flex">
      <div className="flex h-16 items-center px-6">
        <Link href="/app"><Logo /></Link>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const isActive = active(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm transition-colors ${
                isActive ? 'text-ink' : 'text-muted hover:text-ink'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 -z-10 rounded-2xl border border-violet/30 bg-violet/10"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <Icon className={isActive ? 'text-violet' : ''} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3">
        <Link href="/" className="btn btn-ghost w-full justify-start gap-3 px-4">
          <LogoutIcon /> {dict.nav.logout}
        </Link>
      </div>
    </aside>
  );
}

export function CabinetBottomBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/8 bg-bg-2/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="grid grid-cols-5">
        {NAV.slice(0, 5).map((item) => {
          const isActive = active(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[10px] ${isActive ? 'text-violet' : 'text-muted'}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// --- Иконки (тонкие линии) -------------------------------------------------
type IP = { className?: string };
const base = 'h-5 w-5';
function DashIcon({ className = '' }: IP) {
  return (<svg className={`${base} ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/></svg>);
}
function ListIcon({ className = '' }: IP) {
  return (<svg className={`${base} ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round"/></svg>);
}
function CardIcon({ className = '' }: IP) {
  return (<svg className={`${base} ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20" strokeLinecap="round"/></svg>);
}
function ImportIcon({ className = '' }: IP) {
  return (<svg className={`${base} ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round"/></svg>);
}
function ChartIcon({ className = '' }: IP) {
  return (<svg className={`${base} ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19V5M4 19h16M8 16l4-5 3 3 4-6" strokeLinecap="round" strokeLinejoin="round"/></svg>);
}
function GearIcon({ className = '' }: IP) {
  return (<svg className={`${base} ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" strokeLinecap="round"/></svg>);
}
function LogoutIcon({ className = '' }: IP) {
  return (<svg className={`${base} ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/></svg>);
}

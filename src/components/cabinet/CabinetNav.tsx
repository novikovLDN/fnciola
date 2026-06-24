'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { LogoutButton } from '@/components/cabinet/LogoutButton';
import { dict } from '@/i18n/ru';

// Десктоп: полная навигация (импорт переехал в «Счета»).
const SIDEBAR_NAV = [
  { href: '/app', label: dict.nav.dashboard, icon: DashIcon },
  { href: '/app/transactions', label: dict.nav.transactions, icon: ListIcon },
  { href: '/app/accounts', label: dict.nav.accounts, icon: CardIcon },
  { href: '/app/projects', label: dict.nav.projects, icon: ChartIcon },
  { href: '/app/settings', label: dict.nav.settings, icon: GearIcon },
];

// Мини-апп: операции — внутри дашборда, импорт — в «Счетах».
const BOTTOM_NAV = [
  { href: '/app', label: 'Главная', icon: DashIcon },
  { href: '/app/accounts', label: dict.nav.accounts, icon: CardIcon },
  { href: '/app/projects', label: dict.nav.projects, icon: ChartIcon },
  { href: '/app/settings', label: dict.nav.settings, icon: GearIcon },
];

function active(pathname: string, href: string): boolean {
  return href === '/app' ? pathname === '/app' : pathname.startsWith(href);
}

export function CabinetSidebar() {
  const pathname = usePathname();
  return (
    <div className="hidden shrink-0 p-3 lg:block">
      <aside className="sticky top-3 flex h-[calc(100vh-1.5rem)] w-60 flex-col overflow-hidden rounded-[1.75rem] border border-ink/8 bg-surface/80 backdrop-blur-xl shadow-[0_20px_60px_-28px_rgba(17,17,19,0.35),0_2px_8px_-4px_rgba(17,17,19,0.1)]">
        <div className="flex h-16 items-center px-6">
          <Link href="/app"><Logo /></Link>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {SIDEBAR_NAV.map((item) => {
            const isActive = active(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm transition-colors ${
                  isActive ? 'text-accent' : 'text-muted hover:text-ink'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-10 rounded-2xl border border-accent/20 bg-accent/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon className={isActive ? 'text-accent' : ''} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3">
          <LogoutButton className="btn btn-ghost w-full justify-start gap-3 px-4" label={dict.nav.logout} />
        </div>
      </aside>
    </div>
  );
}

export function CabinetBottomBar() {
  const pathname = usePathname();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
      {/* Плавающая скруглённая панель — «парит» над фоном (объём как в Telegram) */}
      <nav className="grid w-full max-w-md grid-cols-4 rounded-[1.5rem] border border-ink/8 bg-surface/85 backdrop-blur-xl shadow-[0_18px_40px_-18px_rgba(17,17,19,0.35)]">
        {BOTTOM_NAV.map((item) => {
          const isActive = active(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[10px] leading-tight transition-colors ${isActive ? 'text-accent' : 'text-muted'}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
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

import type { Viewport } from 'next';
import { redirect } from 'next/navigation';
import { CabinetSidebar, CabinetBottomBar } from '@/components/cabinet/CabinetNav';
import { LedgerProvider } from '@/lib/store/useLedger';
import { getCurrentUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// В мини-приложении запрещаем масштабирование жестами (мешает работе).
// Лендинг остаётся масштабируемым (доступность) — это переопределение только для /app.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

/** Каркас кабинета: стеклянная боковая навигация + светлый детализированный фон. */
export default async function CabinetLayout({ children }: { children: React.ReactNode }) {
  // Доступ только для авторизованных — иначе на вход.
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <LedgerProvider>
      <div className="relative flex min-h-screen" style={{ touchAction: 'pan-x pan-y' }}>
      {/* Детализированный фон кабинета */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgb(17 17 19 / 0.5) 1px, transparent 1px), linear-gradient(90deg, rgb(17 17 19 / 0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute -top-40 left-1/4 h-[36rem] w-[36rem] rounded-full opacity-60 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgb(242 78 30 / 0.12), transparent 60%)' }} />
        <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full opacity-50 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgb(255 138 76 / 0.10), transparent 60%)' }} />
      </div>

        <CabinetSidebar />
        <div className="min-w-0 flex-1">
          <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12">{children}</main>
        </div>
        <CabinetBottomBar />
      </div>
    </LedgerProvider>
  );
}

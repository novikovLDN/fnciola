import { CabinetSidebar, CabinetBottomBar } from '@/components/cabinet/CabinetNav';

/** Каркас кабинета: стеклянная боковая навигация + детализированный тёмный фон. */
export default function CabinetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen">
      {/* Детализированный фон кабинета */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgb(255 255 255 / 0.6) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute -top-40 left-1/4 h-[36rem] w-[36rem] rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgb(124 92 255 / 0.4), transparent 60%)' }} />
        <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgb(61 214 245 / 0.4), transparent 60%)' }} />
      </div>

      <CabinetSidebar />
      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12">{children}</main>
      </div>
      <CabinetBottomBar />
    </div>
  );
}

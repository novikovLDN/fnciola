import { CabinetSidebar, CabinetBottomBar } from '@/components/cabinet/CabinetNav';

/** Каркас кабинета: боковая навигация на десктопе, нижняя панель на мобильном (§15.3). */
export default function CabinetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <CabinetSidebar />
      <div className="flex-1 min-w-0">
        <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 pb-24 lg:pb-10">{children}</main>
      </div>
      <CabinetBottomBar />
    </div>
  );
}

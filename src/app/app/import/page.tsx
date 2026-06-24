'use client';

import { PageHeader } from '@/components/cabinet/ui';
import { ImportPanel } from '@/components/cabinet/ImportPanel';

/** Отдельная страница импорта (доступна по прямой ссылке). */
export default function ImportPage() {
  return (
    <div>
      <PageHeader title="Импорт выписок" subtitle="CSV, Excel (XLSX), OFX/QFX, CAMT.053, MT940" />
      <ImportPanel />
    </div>
  );
}

import { demoAccounts } from '@/lib/demo';

/** Импорт выписок (§9, §15.2): загрузка, статус, отчёт, бета-PDF. */
export default function ImportPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl sm:text-3xl">Импорт выписок</h1>
        <p className="text-sm text-ink/60">CSV, XLSX, OFX/QFX, MT940, CAMT.053. PDF — в бета-режиме.</p>
      </header>

      <div className="bento space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-ink/70">Счёт зачисления</span>
            <select className="mt-1 w-full rounded-pill border border-black/10 bg-bg px-4 py-2.5 text-sm">
              {demoAccounts.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-ink/70">Формат</span>
            <select className="mt-1 w-full rounded-pill border border-black/10 bg-bg px-4 py-2.5 text-sm">
              <option>Определить автоматически</option>
              <option>CSV</option>
              <option>XLSX</option>
              <option>OFX / QFX</option>
              <option>MT940</option>
              <option>CAMT.053</option>
              <option>PDF (бета)</option>
            </select>
          </label>
        </div>

        <div className="rounded-bento border-2 border-dashed border-accent/30 bg-accent-soft/20 p-10 text-center">
          <div className="text-3xl mb-2" aria-hidden>⬆️</div>
          <p className="text-sm text-ink/70">Перетащите файл выписки сюда или</p>
          <button className="btn-accent mt-3">Выбрать файл</button>
          <p className="text-xs text-ink/40 mt-3">Файл удаляется с сервера после обработки (§6).</p>
        </div>

        {/* Предупреждение для бета-PDF (§9.1) */}
        <div className="flex items-start gap-3 rounded-bento bg-negative/10 p-4 text-sm">
          <span aria-hidden>⚠️</span>
          <p>
            Импорт PDF и автокатегоризация работают в <strong>бета-режиме</strong> — возможны неточности.
            Проверьте импортированные операции перед сохранением.
          </p>
        </div>
      </div>

      {/* Отчёт об импорте (§9.3) — пример состояния */}
      <div className="bento">
        <h2 className="font-display text-lg mb-4">Последний импорт</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <Stat label="Импортировано" value="128" className="text-positive" />
          <Stat label="Дубликаты" value="14" className="text-ink/60" />
          <Stat label="Ошибки" value="2" className="text-negative" />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-bento bg-bg p-4">
      <div className={`metric-value text-2xl ${className}`}>{value}</div>
      <div className="text-xs text-ink/50 mt-1">{label}</div>
    </div>
  );
}

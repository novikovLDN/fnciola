import type { Metadata, Viewport } from 'next';
import { Geologica, Inter } from 'next/font/google';
import './globals.css';
import { LiveBackground } from '@/components/visual/LiveBackground';

// Display — плотный, широкий, технологичный гротеск (кириллица), тяжёлые начертания.
const geologica = Geologica({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

// Numeric/UI — Inter: надёжные tabular-nums для денежных значений.
const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-text',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Holdy — деньги под контролем. Личные финансы и метрики бизнеса',
  description:
    'Holdy — технологичный учёт личных финансов и управленческих метрик бизнеса: доходы и расходы, аналитика, импорт выписок, мультивалюта, EBITDA, cash flow, runway.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Holdy' },
};

export const viewport: Viewport = {
  themeColor: '#070814',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${geologica.variable}`}>
      <body>
        <LiveBackground />
        {children}
      </body>
    </html>
  );
}

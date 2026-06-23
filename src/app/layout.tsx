import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { LiveBackground } from '@/components/visual/LiveBackground';

// Display — MTS Wide: широкий технологичный гротеск (кириллица), Medium + Bold.
const mtsWide = localFont({
  src: [
    { path: '../fonts/MTSWide-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../fonts/MTSWide-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
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
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${mtsWide.variable}`}>
      <body>
        <LiveBackground />
        {children}
      </body>
    </html>
  );
}

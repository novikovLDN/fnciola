import type { Metadata, Viewport } from 'next';
import { Inter, Unbounded } from 'next/font/google';
import './globals.css';

// Шрифты §14.4 (Google Fonts, кириллица, бесплатные)
const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-text',
  display: 'swap',
});

const unbounded = Unbounded({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Holdy — личные финансы и бизнес-метрики',
  description:
    'Holdy — учёт личных финансов и управленческих метрик бизнеса: доходы и расходы, аналитика, импорт выписок, мультивалютность, EBITDA, runway.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Holdy',
  },
};

export const viewport: Viewport = {
  themeColor: '#101d38',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${unbounded.variable}`}>
      <body>{children}</body>
    </html>
  );
}

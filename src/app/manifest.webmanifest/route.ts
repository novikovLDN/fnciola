import { NextResponse } from 'next/server';

/** PWA-манифест (§13.1). Устанавливается на главный экран; на iOS — через «Поделиться». */
export function GET() {
  return NextResponse.json({
    name: 'Holdy — финансы и бизнес-метрики',
    short_name: 'Holdy',
    description: 'Учёт личных финансов и управленческих метрик бизнеса.',
    start_url: '/app',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f4f2ec',
    theme_color: '#101d38',
    lang: 'ru',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  });
}

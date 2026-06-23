import type { Config } from 'tailwindcss';

/**
 * Дизайн-токены из §14 ТЗ — палитра «Navy + Digital Lavender».
 * Светлая тема по умолчанию; тёмную на MVP не делаем (§19).
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Каналы RGB + <alpha-value> → поддержка модификаторов прозрачности.
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          soft: 'rgb(var(--accent-soft) / <alpha-value>)',
        },
        positive: 'rgb(var(--positive) / <alpha-value>)',
        negative: 'rgb(var(--negative) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        text: ['var(--font-text)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        bento: '1.5rem',
        pill: '9999px',
      },
      boxShadow: {
        // Мягкие тени для «парящих» bento-карточек
        bento: '0 1px 2px rgba(16,29,56,0.04), 0 8px 24px rgba(16,29,56,0.06)',
        'bento-hover': '0 2px 4px rgba(16,29,56,0.06), 0 12px 32px rgba(16,29,56,0.10)',
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from 'tailwindcss';

/** Дизайн-токены «Aurora / Premium Dark». RGB-каналы → поддержка alpha-модификаторов. */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        'bg-2': 'rgb(var(--bg-2) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-2': 'rgb(var(--accent-2) / <alpha-value>)',
        positive: 'rgb(var(--positive) / <alpha-value>)',
        negative: 'rgb(var(--negative) / <alpha-value>)',
        // Алиасы на акцент для совместимости со старыми классами.
        violet: 'rgb(var(--accent) / <alpha-value>)',
        cyan: 'rgb(var(--accent) / <alpha-value>)',
        magenta: 'rgb(var(--accent) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        text: ['var(--font-text)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        bento: '1.5rem',
        '2xl': '1rem',
      },
      backgroundImage: {
        'grad-brand': 'linear-gradient(120deg, rgb(var(--accent)), rgb(var(--accent-2)))',
      },
      boxShadow: {
        glow: '0 10px 30px -10px rgb(var(--accent) / 0.4)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
};

export default config;

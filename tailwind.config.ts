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
        violet: 'rgb(var(--violet) / <alpha-value>)',
        indigo: 'rgb(var(--indigo) / <alpha-value>)',
        cyan: 'rgb(var(--cyan) / <alpha-value>)',
        magenta: 'rgb(var(--magenta) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        positive: 'rgb(var(--positive) / <alpha-value>)',
        negative: 'rgb(var(--negative) / <alpha-value>)',
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
        'grad-brand': 'linear-gradient(120deg, rgb(var(--violet)), rgb(var(--indigo)) 55%, rgb(var(--cyan)))',
      },
      boxShadow: {
        glow: '0 0 40px -8px rgb(var(--violet) / 0.45)',
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

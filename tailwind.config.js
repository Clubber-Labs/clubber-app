/** @type {import('tailwindcss').Config} */

// Helper: cada cor referencia a variável CSS definida em src/global.css.
// O placeholder <alpha-value> permite opacidade (ex: bg-surface/60).
const token = name => `rgb(var(--color-${name}) / <alpha-value>)`

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // superfícies / fundos
        background: token('background'),
        'surface-sunken': token('surface-sunken'),
        surface: {
          DEFAULT: token('surface'),
          elevated: token('surface-elevated'),
          high: token('surface-high'),
          higher: token('surface-higher'),
        },
        // texto / conteúdo
        content: {
          DEFAULT: token('content'),
          bright: token('content-bright'),
          secondary: token('content-secondary'),
          tertiary: token('content-tertiary'),
          muted: token('content-muted'),
          subtle: token('content-subtle'),
          faint: token('content-faint'),
        },
        // bordas
        line: {
          DEFAULT: token('line'),
          strong: token('line-strong'),
          subtle: token('line-subtle'),
        },
        // marca
        brand: {
          DEFAULT: token('brand'),
          emphasis: token('brand-emphasis'),
          strong: token('brand-strong'),
          text: token('brand-text'),
          'text-strong': token('brand-text-strong'),
          'text-bright': token('brand-text-bright'),
          'text-subtle': token('brand-text-subtle'),
          surface: token('brand-surface'),
          'surface-strong': token('brand-surface-strong'),
        },
        // perigo
        danger: {
          DEFAULT: token('danger'),
          strong: token('danger-strong'),
          text: token('danger-text'),
          'text-subtle': token('danger-text-subtle'),
          surface: token('danger-surface'),
        },
        // aviso
        warning: {
          DEFAULT: token('warning'),
          text: token('warning-text'),
          surface: token('warning-surface'),
          'surface-strong': token('warning-surface-strong'),
        },
        // sucesso
        success: {
          DEFAULT: token('success'),
          text: token('success-text'),
          strong: token('success-strong'),
        },
        // informação
        info: token('info'),
      },
    },
  },
}

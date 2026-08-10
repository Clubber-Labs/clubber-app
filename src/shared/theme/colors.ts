/**
 * Espelho JS dos tokens de cor para props que NÃO aceitam className —
 * ícones (@expo/vector-icons), Mapbox, ActivityIndicator, tab bar, etc.
 *
 * Fonte da verdade visual é src/global.css. Manter os valores aqui em
 * sincronia com as variáveis --color-* daquele arquivo.
 */
export const colors = {
  // superfícies / fundos (carvão frio ~hue 215)
  background: '#0e1116',
  surfaceSunken: '#090b0f',
  surface: '#181d24',
  surfaceElevated: '#262d36',
  surfaceHigh: '#3b4552',
  surfaceHigher: '#4e5967',

  // texto / conteúdo
  content: '#ffffff',
  contentBright: '#f2f4f7',
  contentSecondary: '#e2e6eb',
  contentTertiary: '#ccd2da',
  contentMuted: '#9aa4b0',
  contentSubtle: '#6b7684',
  contentFaint: '#4e5967',

  // bordas
  line: '#262d36',
  lineStrong: '#3b4552',
  lineSubtle: '#181d24',

  // marca
  brand: '#7c3aed',
  brandEmphasis: '#8b5cf6',
  brandStrong: '#6d28d9',
  brandText: '#a78bfa',
  brandTextStrong: '#c4b5fd',
  brandTextBright: '#ddd6fe',
  brandTextSubtle: '#ede9fe',
  brandSurface: '#2e1065',
  brandSurfaceStrong: '#4c1d95',

  // perigo
  danger: '#ef4444',
  dangerStrong: '#dc2626',
  dangerText: '#f87171',
  dangerTextSubtle: '#fecaca',
  dangerSurface: '#7f1d1d',

  // aviso
  warning: '#fbbf24',
  warningText: '#fde68a',
  warningSurface: '#78350f',
  warningSurfaceStrong: '#451a03',

  // sucesso
  success: '#22c55e',
  successText: '#4ade80',
  successStrong: '#16a34a',

  // informação (ex: confirmação de "lido")
  info: '#7dd3fc',
} as const

export type ColorToken = keyof typeof colors

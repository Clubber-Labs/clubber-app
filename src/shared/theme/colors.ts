/**
 * Espelho JS dos tokens de cor para props que NÃO aceitam className —
 * ícones (@expo/vector-icons), Mapbox, ActivityIndicator, tab bar, etc.
 *
 * Fonte da verdade visual é src/global.css. Manter os valores aqui em
 * sincronia com as variáveis --color-* daquele arquivo.
 */
export const colors = {
  // superfícies / fundos (zinc profundo)
  background: '#0b0b0d',
  surfaceSunken: '#060607',
  surface: '#18181b',
  surfaceElevated: '#27272a',
  surfaceHigh: '#3f3f46',
  surfaceHigher: '#52525b',

  // texto / conteúdo
  content: '#ffffff',
  contentBright: '#f2f4f7',
  contentSecondary: '#e2e6eb',
  contentTertiary: '#ccd2da',
  contentMuted: '#9aa4b0',
  contentSubtle: '#6b7684',
  contentFaint: '#4e5967',

  // bordas
  line: '#27272a',
  lineStrong: '#3f3f46',
  lineSubtle: '#18181b',

  // ação/realce — ex-marca violeta, agora neutros (nomes legados; ver global.css)
  brand: '#3f3f46',
  brandEmphasis: '#9aa4b0',
  brandStrong: '#52525b',
  brandText: '#ccd2da',
  brandTextStrong: '#e2e6eb',
  brandTextBright: '#f2f4f7',
  brandTextSubtle: '#f2f4f7',
  brandSurface: '#27272a',
  brandSurfaceStrong: '#3f3f46',

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
  successSurface: '#153a26',

  // informação (ex: confirmação de "lido")
  info: '#7dd3fc',
} as const

export type ColorToken = keyof typeof colors

/**
 * Espelho JS dos tokens de cor para props que NÃO aceitam className —
 * ícones (phosphor-react-native), Mapbox, ActivityIndicator, tab bar, etc.
 *
 * Fonte da verdade visual é src/global.css. Manter os valores aqui em
 * sincronia com as variáveis --color-* daquele arquivo.
 */
export const colors = {
  // superfícies / fundos (azul-preto, escala no matiz do fundo)
  background: '#05080d',
  surfaceSunken: '#020408',
  surface: '#16191d',
  surfaceElevated: '#24282d',
  surfaceHigh: '#3d4148',
  surfaceHigher: '#50555d',

  // texto / conteúdo
  content: '#ffffff',
  contentBright: '#f2f4f7',
  contentSecondary: '#e2e6eb',
  contentTertiary: '#ccd2da',
  contentMuted: '#9aa4b0',
  contentSubtle: '#6b7684',
  contentFaint: '#4e5967',

  // bordas
  line: '#24282d',
  lineStrong: '#3d4148',
  lineSubtle: '#16191d',

  // ação/realce — ex-marca violeta, agora neutros (nomes legados; ver global.css)
  brand: '#3d4148',
  brandEmphasis: '#9aa4b0',
  brandStrong: '#50555d',
  brandText: '#ccd2da',
  brandTextStrong: '#e2e6eb',
  brandTextBright: '#f2f4f7',
  brandTextSubtle: '#f2f4f7',
  brandSurface: '#24282d',
  brandSurfaceStrong: '#3d4148',

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

  // marca de terceiro, sem variável no global.css — as guidelines do Spotify
  // pedem o logo verde oficial ou branco
  spotify: '#1ED760',
} as const

export type ColorToken = keyof typeof colors

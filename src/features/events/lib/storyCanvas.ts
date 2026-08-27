import { Image, PixelRatio } from 'react-native'

// A arte do story é especificada num canvas de 1080×1920 — as medidas do
// design são unidades DESTE canvas, não dp.
export const STORY_CANVAS = { width: 1080, height: 1920 } as const

// O composer do Instagram sobrepõe UI própria no topo e no rodapé: nada
// legível pode viver fora desta faixa.
export const STORY_SAFE_INSET = 250

// O view-shot do Android captura o bitmap no tamanho FÍSICO da view e só então
// redimensiona (Bitmap.createScaledBitmap) — montar a arte num dp fixo sairia
// borrada em aparelho de densidade baixa e gigante em densidade alta. Medir a
// view em 1080/densidade faz o bitmap nascer com 1080px reais em qualquer
// aparelho, e o resize da captura vira no-op.
const SCALE = 1 / PixelRatio.get()

/** Converte unidade do canvas de 1080 para dp. */
export const u = (n: number) => n * SCALE

export const STORY_WIDTH_DP = u(STORY_CANVAS.width)
export const STORY_HEIGHT_DP = u(STORY_CANVAS.height)

// Mesma régua da tela de convite: usa a proporção REAL do flyer (festa é
// retrato na maioria), com clamp pros extremos não quebrarem a composição.
const MIN_ASPECT = 3 / 4
const MAX_ASPECT = 16 / 9
export const FALLBACK_ASPECT = MIN_ASPECT

export function measureCoverAspect(url: string): Promise<number> {
  return new Promise(resolve => {
    Image.getSize(
      url,
      (width, height) => {
        if (width <= 0 || height <= 0) return resolve(FALLBACK_ASPECT)
        resolve(Math.min(Math.max(width / height, MIN_ASPECT), MAX_ASPECT))
      },
      () => resolve(FALLBACK_ASPECT),
    )
  })
}

type MediaBoxOpts = {
  maxWidth: number
  maxHeight: number
  // Limites de aspect (largura/altura) pra mídia muito extrema não virar uma
  // fita; opcionais (imagem não clampa, vídeo sim). minAspect = mais vertical
  // permitido, maxAspect = mais horizontal permitido.
  minAspect?: number
  maxAspect?: number
  // Lado da caixa quadrada quando não há dimensões (mídia local otimista).
  fallback: number
}

// Caixa de exibição de mídia visual (imagem/vídeo) a partir das dimensões reais,
// preservando o aspect-ratio dentro dos limites: nunca mais larga que maxWidth
// nem mais alta que maxHeight. Reservar a caixa pelo aspect evita o "pulo" de
// layout quando a mídia carrega.
export function mediaBoxSize(
  width: number | undefined,
  height: number | undefined,
  { maxWidth, maxHeight, minAspect, maxAspect, fallback }: MediaBoxOpts,
): { width: number; height: number } {
  if (!width || !height || width <= 0 || height <= 0) {
    return { width: fallback, height: fallback }
  }
  let aspect = width / height
  if (minAspect != null) aspect = Math.max(minAspect, aspect)
  if (maxAspect != null) aspect = Math.min(maxAspect, aspect)

  let w = maxWidth
  let h = w / aspect
  if (h > maxHeight) {
    h = maxHeight
    w = h * aspect
  }
  return { width: Math.round(w), height: Math.round(h) }
}

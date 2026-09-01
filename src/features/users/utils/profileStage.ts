// Geometria do palco do perfil (mural ↔ eventos). Funções puras e worklets:
// rodam na thread de UI dentro do gesto, então nada aqui toca React.

export type StageFocus = 'mural' | 'events'

// Respiro entre o fim do mural (modo resumo) e o cabeçalho de eventos. Vive
// DENTRO da seção de eventos (padding com fundo opaco): o mural tem sempre a
// altura do palco, e um vão entre as seções deixaria a 3ª fileira aparecer.
export const STAGE_SECTION_GAP = 8
// Tiles quadrados em 3 colunas, colados à borda da tela. O resto da geometria
// (fileiras do resumo, vaga do "+", véu "+N", limiar de expansão) deriva daqui.
export const MURAL_COLUMNS = 3
export const MURAL_GAP = 2
export const MURAL_SUMMARY_ROWS = 2
export const MURAL_SUMMARY_COUNT = MURAL_COLUMNS * MURAL_SUMMARY_ROWS
// Altura fixa do cabeçalho de seção — a geometria do palco é calculada, não
// medida, e uma altura de conteúdo aqui a tornaria imprevisível.
export const SECTION_HEADER_HEIGHT = 44
// Estado vazio do mural em modo resumo: altura fixa pela mesma razão.
export const MURAL_EMPTY_HEIGHT = 112

export function muralTileSize(width: number): number {
  return (width - MURAL_GAP * (MURAL_COLUMNS - 1)) / MURAL_COLUMNS
}

// Fileiras do resumo: até 3 fotos cabem numa, o resto ocupa duas. O "+" do
// dono entra na vaga livre da fileira, nunca abre outra.
export function muralSummaryRows(photoCount: number): number {
  if (photoCount <= 0) return 0
  return Math.min(MURAL_SUMMARY_ROWS, Math.ceil(photoCount / MURAL_COLUMNS))
}

// Altura do mural no modo resumo (cabeçalho + fileiras, ou o estado vazio).
export function muralSummaryHeight(width: number, photoCount: number): number {
  const rows = muralSummaryRows(photoCount)
  if (rows === 0) return SECTION_HEADER_HEIGHT + MURAL_EMPTY_HEIGHT
  return (
    SECTION_HEADER_HEIGHT + muralTileSize(width) * rows + MURAL_GAP * (rows - 1)
  )
}

// Só vale expandir quando há mais que as duas fileiras do resumo.
export function muralExpandable(
  totalCount: number,
  hasNextPage: boolean,
): boolean {
  return hasNextPage || totalCount > MURAL_SUMMARY_COUNT
}

// Vaga livre na última fileira do resumo — onde o "+" do dono se encaixa.
export function muralHasFreeSlot(photoCount: number): boolean {
  return photoCount < MURAL_SUMMARY_COUNT && photoCount % MURAL_COLUMNS !== 0
}

// Qual seção o toque escolheu: acima do fim do mural é mural (o cabeçalho do
// perfil conta como mural). Mural travado (vazio ou sem mais que o resumo) não
// tem o que expandir — vira eventos.
export function focusForTouch(
  y: number,
  headerHeight: number,
  muralHeight: number,
  muralLocked: boolean,
): StageFocus {
  'worklet'
  if (muralLocked) return 'events'
  return y < headerHeight + muralHeight ? 'mural' : 'events'
}

// Quanto a seção focada percorre até encaixar no topo: o dedo e a seção andam
// 1:1, então o progresso é o deslocamento dividido por esta distância.
export function travelDistance(
  focus: StageFocus,
  headerHeight: number,
  muralHeight: number,
): number {
  'worklet'
  return focus === 'mural' ? headerHeight : headerHeight + muralHeight
}

export function nextExpand(
  start: number,
  translationY: number,
  distance: number,
): number {
  'worklet'
  if (distance <= 0) return start
  const next = start - translationY / distance
  return Math.min(1, Math.max(0, next))
}

const FLICK_VELOCITY = 300
// A seção de eventos percorre header + mural (~600px) até o topo: exigir
// metade disso antes de encaixar pesa no dedo. Um terço do caminho já diz a
// intenção.
const SNAP_RATIO = 0.35

// Ao soltar: um flick decide pela direção; sem flick, a intenção pelo caminho.
export function snapTarget(expand: number, velocityY: number): 0 | 1 {
  'worklet'
  if (Math.abs(velocityY) > FLICK_VELOCITY) return velocityY < 0 ? 1 : 0
  return expand > SNAP_RATIO ? 1 : 0
}

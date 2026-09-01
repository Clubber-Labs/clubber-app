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

// Estágios do foco. Mural: um só (eventos desce e sai). Eventos: dois —
// sobe a altura do mural e encaixa sob o header fixo (1); depois header e
// folha sobem juntos até o header sair (2). Só então a lista rola.
export function stageMax(focus: StageFocus): number {
  'worklet'
  return focus === 'events' ? 2 : 1
}

export type StageTravel = { first: number; second: number }

// Quanto cada estágio percorre em pixels, pra o dedo e a seção andarem 1:1.
export function stageTravel(
  focus: StageFocus,
  headerHeight: number,
  muralHeight: number,
  stageHeight: number,
): StageTravel {
  'worklet'
  if (focus === 'mural') {
    return {
      first: Math.max(1, stageHeight - headerHeight - muralHeight),
      second: 0,
    }
  }
  return { first: Math.max(1, muralHeight), second: Math.max(1, headerHeight) }
}

function travelPx(expand: number, travel: StageTravel): number {
  'worklet'
  return expand <= 1
    ? expand * travel.first
    : travel.first + (expand - 1) * travel.second
}

function expandFromPx(px: number, travel: StageTravel, max: number): number {
  'worklet'
  const total = travel.first + (max - 1) * travel.second
  const clamped = Math.min(total, Math.max(0, px))
  return clamped <= travel.first
    ? clamped / travel.first
    : 1 + (clamped - travel.first) / travel.second
}

// Progresso a partir do deslocamento do dedo (pra cima = avança), contínuo
// através dos estágios: o pixel manda, o estágio é só a régua.
export function nextExpand(
  start: number,
  translationY: number,
  travel: StageTravel,
  max: number,
): number {
  'worklet'
  return expandFromPx(travelPx(start, travel) - translationY, travel, max)
}

const FLICK_VELOCITY = 300
// Um terço do estágio já diz a intenção; exigir metade pesa no dedo.
const SNAP_RATIO = 0.35

// Ao soltar: um flick vai pro próximo estágio na direção; sem flick, a
// intenção pelo caminho percorrido desde o estágio de partida.
export function snapTarget(
  expand: number,
  start: number,
  velocityY: number,
  max: number,
): number {
  'worklet'
  const clamp = (value: number) => Math.min(max, Math.max(0, value))
  if (Math.abs(velocityY) > FLICK_VELOCITY) {
    return clamp(velocityY < 0 ? Math.floor(expand) + 1 : Math.ceil(expand) - 1)
  }
  const from = clamp(Math.round(start))
  if (expand > from) return clamp(expand - from > SNAP_RATIO ? from + 1 : from)
  return clamp(from - expand > SNAP_RATIO ? from - 1 : from)
}

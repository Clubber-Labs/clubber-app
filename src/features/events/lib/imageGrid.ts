export type GridGeometry = {
  size: number
  gap: number
  columns: number
}

function clamp(value: number, min: number, max: number): number {
  'worklet'
  return Math.min(max, Math.max(min, value))
}

export function tileSize(width: number, gap: number, columns: number): number {
  return (width - gap * (columns - 1)) / columns
}

export function slotPosition(
  index: number,
  { size, gap, columns }: GridGeometry,
) {
  'worklet'
  const pitch = size + gap
  return {
    x: (index % columns) * pitch,
    y: Math.floor(index / columns) * pitch,
  }
}

export function gridHeight(
  slots: number,
  { size, gap, columns }: GridGeometry,
) {
  const rows = Math.max(1, Math.ceil(slots / columns))
  return rows * (size + gap) - gap
}

/**
 * Slot sob um ponto do grid. O consumidor passa o CENTRO do tile arrastado, e
 * não o dedo: a troca então acontece quando a foto cobre a metade da vizinha,
 * que é o que o olho lê como "chegou lá".
 */
export function slotAtPoint(
  x: number,
  y: number,
  { size, gap, columns }: GridGeometry,
  count: number,
): number {
  'worklet'
  const pitch = size + gap
  const column = clamp(Math.floor(x / pitch), 0, columns - 1)
  const row = Math.max(0, Math.floor(y / pitch))
  return clamp(row * columns + column, 0, count - 1)
}

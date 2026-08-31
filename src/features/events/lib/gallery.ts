import type { EventImage } from '@/shared/types'

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export function sameSequence(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id, i) => id === b[i])
}

function sameSet(images: EventImage[], order: string[]): boolean {
  const ids = new Set(order)
  if (ids.size !== order.length || ids.size !== images.length) return false
  return images.every(image => ids.has(image.id))
}

/**
 * Aplica uma ordem local (a do arraste em curso) sobre a galeria do servidor.
 * Ordem que não é rearranjo exato da galeria — porque uma foto entrou ou saiu
 * enquanto se arrastava — é descartada: é a mesma condição que o backend cobra
 * no PATCH, então o que sobrevive aqui é exatamente o que ele aceita.
 */
export function sortByOrder(
  images: EventImage[],
  order: string[] | null,
): EventImage[] {
  if (!order || !sameSet(images, order)) return images
  const byId = new Map(images.map(image => [image.id, image]))
  return order.flatMap(id => {
    const image = byId.get(id)
    return image ? [image] : []
  })
}

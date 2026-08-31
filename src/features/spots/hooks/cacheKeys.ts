import { feedKey } from '@/features/events/hooks/cacheKeys'
import type { Bbox } from '@/features/map/services/mapService'
import type { MapFilterParams } from '@/features/map/types'

const VIEWPORT = ['spots', 'viewport'] as const

export const spotKeys = {
  all: ['spots'] as const,
  viewport: (bbox: Bbox | null, filters: MapFilterParams) =>
    [...VIEWPORT, bbox, filters] as const,
  // Prefixo de TODAS as variações de viewport — pra invalidar/editar em massa.
  viewportAll: VIEWPORT,
  detail: (id: string) => ['spots', 'detail', id] as const,
}

/**
 * Onde um rolê aparece em lista: balões do mapa e cards do feed (o /feed
 * mescla eventos e rolês numa resposta só). Quem altera um rolê precisa
 * alcançar as duas — senão cancelar pelo card o tira do mapa e o deixa no feed.
 *
 * Os dois caches têm FORMATOS diferentes (array plano vs. páginas de cursor):
 * quem edita in-place trata cada um; quem só invalida pode iterar.
 */
export const spotListKeys = [spotKeys.viewportAll, feedKey] as const

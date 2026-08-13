import { api } from '@/shared/lib/api'
import type { Bbox } from '@/features/map/services/mapService'
import type { MapFilterParams } from '@/features/map/types'
import type { CreateSpotPayload } from '../schemas/createSpotSchema'
import type { UpdateSpotPayload } from '../schemas/editSpotSchema'
import type {
  Spot,
  SpotSuggestionsParams,
  SpotSuggestionsResponse,
} from '../types'

type ListParams = Bbox & MapFilterParams & { limit?: number }

export const spotsService = {
  // Consome quota diária — o caller deve travar o botão enquanto pendente.
  generateSuggestions: (
    params: SpotSuggestionsParams,
  ): Promise<SpotSuggestionsResponse> =>
    api.post('/spots/suggestions', params).then(r => r.data),

  // Salva o raio padrão da busca de spots (inteiro, min 2, ≤ teto). Mesmo modelo
  // do PATCH de notification-prefs; 400 "Raio máximo permitido: Nkm" se exceder.
  updateSpotPrefs: (
    spotRadiusKm: number,
  ): Promise<{ id: string; spotRadiusKm: number }> =>
    api.patch('/users/me/spot-prefs', { spotRadiusKm }).then(r => r.data),

  create: (data: CreateSpotPayload): Promise<Spot> =>
    api.post('/spots', data).then(r => r.data),

  // Só spots ativos (não cancelados e endsAt > now). Deslogado vê só PUBLIC;
  // visibilidade/bloqueio são decididos pelo backend. O status do rolê é
  // derivado do startsAt lá — PAST/CANCELED nunca casam com a lista ativa.
  listByBbox: ({
    bboxNorth,
    bboxSouth,
    bboxEast,
    bboxWest,
    status,
    category,
    friendsOnly,
    limit,
  }: ListParams): Promise<Spot[]> =>
    api
      .get('/spots', {
        params: {
          bboxNorth,
          bboxSouth,
          bboxEast,
          bboxWest,
          ...(status?.length ? { status } : {}),
          ...(category?.length ? { category } : {}),
          ...(friendsOnly ? { friendsOnly: true } : {}),
          ...(limit ? { limit } : {}),
        },
        // Backend espera array repetido (status=A&status=B), não brackets nem
        // CSV — CSV volta 400.
        paramsSerializer: { indexes: null },
      })
      .then(r => r.data),

  getById: (id: string): Promise<Spot> =>
    api.get(`/spots/${id}`).then(r => r.data),

  // 201 na 1ª vez, 200 se já é membro — ambos devolvem o conversationId.
  join: (id: string): Promise<{ conversationId: string }> =>
    api.post(`/spots/${id}/members`).then(r => r.data),

  update: (id: string, data: UpdateSpotPayload): Promise<Spot> =>
    api.patch(`/spots/${id}`, data).then(r => r.data),

  // Empurra o endsAt em +24h. Consome 1 da MESMA quota diária do gerar
  // (429 ao estourar) — o caller trava o botão enquanto pendente.
  renew: (id: string): Promise<Spot> =>
    api.post(`/spots/${id}/renew`).then(r => r.data),

  cancel: (id: string): Promise<void> =>
    api.delete(`/spots/${id}`).then(() => undefined),
}

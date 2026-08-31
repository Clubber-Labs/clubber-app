import { useQuery } from '@tanstack/react-query'
import { spotsService } from '../services/spotsService'
import { spotKeys } from './cacheKeys'

// Poucos cards: a seção é um aperitivo dentro do feed, não a listagem de rolês
// (essa é o mapa).
const NEARBY_LIMIT = 10

/**
 * Rolês ativos perto do usuário, pro bloco do feed. Coords em [lng, lat]
 * (convenção Mapbox do app) — sem elas a query nem sai, porque o modo
 * ponto+raio do backend exige o par.
 */
export function useNearbySpots(coords: [number, number] | null) {
  return useQuery({
    queryKey: spotKeys.nearby(coords),
    queryFn: () =>
      spotsService.listNearby({
        nearLat: coords![1],
        nearLng: coords![0],
        limit: NEARBY_LIMIT,
      }),
    enabled: !!coords,
    staleTime: 1000 * 60,
  })
}

import { api } from '@/shared/lib/api'

export type VenueSuggestion = {
  placeId: string
  name: string
  address: string | null
}

export type PlaceDetails = {
  placeId: string
  latitude: number
  longitude: number
  address: string | null
  types: string[]
}

type AutocompleteParams = {
  q: string
  // Localização atual em [longitude, latitude] (ordem do useUserLocation);
  // opcional — vira viés de proximidade só quando disponível.
  coords: [number, number] | null
  sessionToken: string
  signal?: AbortSignal
}

export const placesService = {
  autocomplete: ({
    q,
    coords,
    sessionToken,
    signal,
  }: AutocompleteParams): Promise<{ suggestions: VenueSuggestion[] }> =>
    api
      .get('/places/autocomplete', {
        params: {
          q,
          sessionToken,
          ...(coords ? { lat: coords[1], lng: coords[0] } : {}),
        },
        signal,
      })
      .then(r => r.data),

  // O mesmo sessionToken da busca fecha a sessão no Google (cobrança única).
  getDetails: (placeId: string, sessionToken: string): Promise<PlaceDetails> =>
    api
      .get(`/places/${placeId}`, { params: { sessionToken } })
      .then(r => r.data),
}

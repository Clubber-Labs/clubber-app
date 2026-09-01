import Constants from 'expo-constants'
import { i18n } from '@/shared/i18n'

export type GeocodingResult = {
  id: string
  placeName: string
  shortName: string
  latitude: number
  longitude: number
  isPoi: boolean
}

type MapboxFeature = {
  id: string
  place_name: string
  text: string
  center: [number, number]
  place_type: string[]
  properties?: {
    category?: string
    address?: string
  }
}

type MapboxResponse = {
  features: MapboxFeature[]
}

const accessToken = Constants.expoConfig?.extra?.mapboxAccessToken as
  | string
  | undefined

export const geocodingService = {
  async search(
    query: string,
    coords: [number, number] | null,
  ): Promise<GeocodingResult[]> {
    if (!accessToken) return []
    const trimmed = query.trim()
    if (trimmed.length < 3) return []

    const types = 'poi,address,place,locality,neighborhood'
    // Recorte geográfico, não político: `proximity` (lng,lat) enviesa pro
    // entorno; `country` no Mapbox é filtro e esvaziaria a lista fora do país.
    const proximity = coords ? `&proximity=${coords[0]},${coords[1]}` : ''
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      trimmed,
    )}.json?access_token=${accessToken}&autocomplete=true&language=${i18n.language}${proximity}&limit=7&types=${types}`

    const res = await fetch(url)
    if (!res.ok) throw new Error('Falha ao buscar endereços')

    const json = (await res.json()) as MapboxResponse

    const seen = new Set<string>()

    return json.features.reduce<GeocodingResult[]>((acc, feature) => {
      if (seen.has(feature.id)) return acc
      seen.add(feature.id)

      acc.push({
        id: feature.id,
        placeName: feature.place_name,
        shortName: feature.text,
        longitude: feature.center[0],
        latitude: feature.center[1],
        isPoi: feature.place_type?.includes('poi') ?? false,
      })

      return acc
    }, [])
  },
}

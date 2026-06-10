import ngeohash from 'ngeohash'

// Mesmo regex autoritativo do backend: precisão 6 exata (~1,2km de célula).
const GEOHASH6_REGEX = /^[0-9bcdefghjkmnpqrstuvwxyz]{6}$/

// Converte a coordenada em geohash de precisão 6 NO DEVICE — é a única forma
// da posição que sai do aparelho (minimização de dados / LGPD).
export function encodeGeohash6(
  latitude: number,
  longitude: number,
): string | null {
  const geohash = ngeohash.encode(latitude, longitude, 6)
  return GEOHASH6_REGEX.test(geohash) ? geohash : null
}

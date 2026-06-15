// Distância em km entre duas coordenadas no formato [longitude, latitude]
// (convenção Mapbox usada no mapa). Haversine — precisão suficiente pra dar o
// contexto de "perto de você" nos cards do mapa.
const EARTH_RADIUS_KM = 6371

export function distanceKm(
  from: [number, number],
  to: [number, number],
): number {
  const [lng1, lat1] = from
  const [lng2, lat2] = to
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(a))
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

// "350 m" / "1,2 km" / "12 km" — vírgula decimal pt-BR.
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  if (km < 10) return `${km.toFixed(1).replace('.', ',')} km`
  return `${Math.round(km)} km`
}

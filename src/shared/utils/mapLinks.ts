export type MapTarget = {
  address?: string | null
  latitude?: number | null
  longitude?: number | null
}

type WithCoords = MapTarget & { latitude: number; longitude: number }

function hasCoords(target: MapTarget): target is WithCoords {
  return (
    typeof target.latitude === 'number' && typeof target.longitude === 'number'
  )
}

export function hasMapTarget(target: MapTarget): boolean {
  return hasCoords(target) || !!target.address
}

// Coordenada é mais confiável que texto livre pro pino; cai pro endereço só
// quando não há lat/lng (ex: resumos de evento sem coordenadas).
export function googleMapsUrl(target: MapTarget): string {
  const query = hasCoords(target)
    ? `${target.latitude},${target.longitude}`
    : (target.address ?? '')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

// q = rótulo/busca; ll = centro do mapa. Com os dois, o Apple Maps fixa o pino
// na coordenada e rotula com o endereço.
export function appleMapsUrl(target: MapTarget): string {
  const label =
    target.address ??
    (hasCoords(target) ? `${target.latitude},${target.longitude}` : '')
  const parts = [`q=${encodeURIComponent(label)}`]
  if (hasCoords(target)) parts.push(`ll=${target.latitude},${target.longitude}`)
  return `https://maps.apple.com/?${parts.join('&')}`
}

// Link universal do Waze: abre o app se instalado, senão a web. Usa coordenada
// quando houver; senão busca pelo endereço. navigate=yes já inicia a rota.
export function wazeUrl(target: MapTarget): string {
  if (hasCoords(target)) {
    return `https://waze.com/ul?ll=${target.latitude},${target.longitude}&navigate=yes`
  }
  return `https://waze.com/ul?q=${encodeURIComponent(target.address ?? '')}&navigate=yes`
}

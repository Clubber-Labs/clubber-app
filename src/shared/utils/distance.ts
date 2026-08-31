import { i18n, type MeasurementSystem } from '@/shared/i18n'

// Distância em km entre duas coordenadas no formato [longitude, latitude]
// (convenção Mapbox usada no mapa). Haversine — precisão suficiente pra dar o
// contexto de "perto de você" nos cards do mapa.
const EARTH_RADIUS_KM = 6371
const KM_PER_MILE = 1.609344
const FEET_PER_KM = 3280.84

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

// `style: 'unit'` resolve separador decimal E rótulo de unidade de uma vez, mas
// depende de dados de unidade do ICU que o Hermes nem sempre traz — mesmo motivo
// do fallback em formatPrice. Degrada pro número formatado + rótulo do dicionário.
function formatUnit(
  value: number,
  locale: string,
  unit: 'meter' | 'kilometer' | 'foot' | 'mile',
  maximumFractionDigits: number,
): string {
  // Arredonda no VALOR, não só na opção: o Hermes do iOS ignora
  // maximumFractionDigits com style:'unit' e despeja o float inteiro —
  // "3,896 km" (três casas do default do ICU), que em pt-BR se lê como
  // 3.896 km. A opção fica de cinto pros engines que a respeitam.
  const factor = 10 ** maximumFractionDigits
  const rounded = Math.round(value * factor) / factor
  try {
    return new Intl.NumberFormat(locale, {
      style: 'unit',
      unit,
      unitDisplay: 'short',
      maximumFractionDigits,
    }).format(rounded)
  } catch {
    const number = new Intl.NumberFormat(locale, {
      maximumFractionDigits,
    }).format(rounded)
    return i18n.t(`format.unit.${unit}` as const, {
      lng: locale,
      value: number,
    })
  }
}

// "350 m" / "1,2 km" / "12 km" — e milha/pé onde o aparelho pede. O sistema de
// medida é do aparelho, não do idioma: es-US quer milhas tanto quanto en-US.
export function formatDistance(
  km: number,
  locale: string,
  system: MeasurementSystem = 'metric',
): string {
  if (system === 'metric') {
    if (km < 1) return formatUnit(Math.round(km * 1000), locale, 'meter', 0)
    if (km < 10) return formatUnit(km, locale, 'kilometer', 1)
    return formatUnit(Math.round(km), locale, 'kilometer', 0)
  }

  const miles = km / KM_PER_MILE
  if (miles < 0.1) {
    return formatUnit(Math.round(km * FEET_PER_KM), locale, 'foot', 0)
  }
  if (miles < 10) return formatUnit(miles, locale, 'mile', 1)
  return formatUnit(Math.round(miles), locale, 'mile', 0)
}

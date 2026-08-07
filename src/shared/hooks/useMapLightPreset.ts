import { useEffect, useState } from 'react'
import { AppState } from 'react-native'

export type MapLightPreset = 'dawn' | 'day' | 'dusk' | 'night'

// Faixas fixas por hora local (sem nascer/pôr do sol real por enquanto):
// transições curtas nas pontas, dia claro no miolo, noite no resto.
export function lightPresetForHour(hour: number): MapLightPreset {
  if (hour >= 6 && hour < 7) return 'dawn'
  if (hour >= 7 && hour < 17) return 'day'
  if (hour >= 17 && hour < 19) return 'dusk'
  return 'night'
}

const CHECK_INTERVAL_MS = 60_000

// Preset de luz do Mapbox Standard conforme a hora local. Reavalia a cada
// minuto e ao voltar pro foreground (timers pausam em background no iOS).
export function useMapLightPreset(): MapLightPreset {
  const [preset, setPreset] = useState<MapLightPreset>(() =>
    lightPresetForHour(new Date().getHours()),
  )

  useEffect(() => {
    const refresh = () => setPreset(lightPresetForHour(new Date().getHours()))
    const interval = setInterval(refresh, CHECK_INTERVAL_MS)
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') refresh()
    })
    return () => {
      clearInterval(interval)
      subscription.remove()
    }
  }, [])

  return preset
}

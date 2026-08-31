import { useEffect, useState } from 'react'
import { AppState } from 'react-native'
import { spotProgress } from '../utils/spotWindow'

const TICK_MS = 60_000

/**
 * Avanço da janela do rolê, reavaliado a cada minuto. Nada aqui pede precisão
 * de segundo — uma barra de horas e um "acaba em Xh" não mudam, e o re-render
 * por segundo sairia caro num card de lista.
 */
export function useSpotProgress(startsAt: string, endsAt: string) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const tick = () => setNow(Date.now())
    const interval = setInterval(tick, TICK_MS)
    // Timer pausa em background no iOS: sem isto a barra volta do multitarefa
    // congelada no minuto em que o app saiu de cena.
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') tick()
    })
    return () => {
      clearInterval(interval)
      subscription.remove()
    }
  }, [])

  return spotProgress(startsAt, endsAt, now)
}

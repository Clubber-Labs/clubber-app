import { useEffect, useState } from 'react'
import * as Location from 'expo-location'

type Coords = [number, number]
export type LocationStatus = 'loading' | 'denied' | 'error' | 'ready'

type Result = {
  coords: Coords | null
  status: LocationStatus
}

export function useUserLocation(): Result {
  const [coords, setCoords] = useState<Coords | null>(null)
  const [status, setStatus] = useState<LocationStatus>('loading')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const permission = await Location.requestForegroundPermissionsAsync()
        if (cancelled) return
        if (permission.status !== 'granted') {
          setStatus('denied')
          return
        }
        const pos = await Location.getCurrentPositionAsync({})
        if (cancelled) return
        setCoords([pos.coords.longitude, pos.coords.latitude])
        setStatus('ready')
      } catch {
        if (!cancelled) setStatus('error')
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { coords, status }
}

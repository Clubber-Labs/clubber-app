import { useEffect, useState } from 'react'
import * as Location from 'expo-location'

type Coords = [number, number]

export function useUserLocation() {
  const [coords, setCoords] = useState<Coords | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') return
      const pos = await Location.getCurrentPositionAsync({})
      if (cancelled) return
      setCoords([pos.coords.longitude, pos.coords.latitude])
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return coords
}

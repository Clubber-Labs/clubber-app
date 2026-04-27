import { useCallback, useRef } from 'react'
import Mapbox from '@rnmapbox/maps'
import { MAX_ZOOM, MIN_ZOOM, USER_ZOOM } from '../constants'

type Coords = [number, number]

export function useMapCamera() {
  const cameraRef = useRef<Mapbox.Camera>(null)
  const mapRef = useRef<Mapbox.MapView>(null)

  const flyTo = useCallback(
    (coords: Coords, zoom?: number, duration = 500) => {
      cameraRef.current?.setCamera({
        centerCoordinate: coords,
        ...(typeof zoom === 'number' ? { zoomLevel: zoom } : {}),
        animationDuration: duration,
      })
    },
    [],
  )

  const adjustZoom = useCallback(async (delta: number) => {
    const map = mapRef.current
    if (!map) return
    const current = await map.getZoom()
    const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, current + delta))
    cameraRef.current?.setCamera({ zoomLevel: next, animationDuration: 250 })
  }, [])

  const focusOnEvent = useCallback(
    (coords: Coords) => flyTo(coords, USER_ZOOM, 500),
    [flyTo],
  )

  return { cameraRef, mapRef, flyTo, adjustZoom, focusOnEvent }
}

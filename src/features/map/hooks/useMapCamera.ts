import { useCallback, useRef } from 'react'
import Mapbox from '@rnmapbox/maps'
import { MARKERS_ZOOM_THRESHOLD, MAX_ZOOM, MIN_ZOOM } from '../constants'

const FOCUS_ZOOM = MARKERS_ZOOM_THRESHOLD + 1
const COINCIDENT_THRESHOLD = 0.0005

type Coords = [number, number]

export type FitPadding = {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

const DEFAULT_FIT_PADDING: Required<FitPadding> = {
  top: 80,
  right: 40,
  bottom: 360,
  left: 40,
}

export function useMapCamera() {
  const cameraRef = useRef<Mapbox.Camera>(null)
  const mapRef = useRef<Mapbox.MapView>(null)

  const flyTo = useCallback((coords: Coords, zoom?: number, duration = 500) => {
    cameraRef.current?.setCamera({
      centerCoordinate: coords,
      ...(typeof zoom === 'number' ? { zoomLevel: zoom } : {}),
      animationDuration: duration,
    })
  }, [])

  const adjustZoom = useCallback(async (delta: number) => {
    const map = mapRef.current
    if (!map) return
    const current = await map.getZoom()
    const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, current + delta))
    cameraRef.current?.setCamera({ zoomLevel: next, animationDuration: 250 })
  }, [])

  const focusOnEvent = useCallback(
    async (coords: Coords) => {
      const map = mapRef.current
      const current = map ? await map.getZoom() : 0
      // não zoom out quando o pin já está visível
      const target = Math.max(current, FOCUS_ZOOM)
      flyTo(coords, target, 500)
    },
    [flyTo],
  )

  const fitToCoords = useCallback(
    (coords: Coords[], padding?: FitPadding, duration = 600) => {
      if (coords.length === 0) return
      const pad = { ...DEFAULT_FIT_PADDING, ...padding }

      let minLng = Infinity
      let minLat = Infinity
      let maxLng = -Infinity
      let maxLat = -Infinity
      for (const [lng, lat] of coords) {
        if (lng < minLng) minLng = lng
        if (lat < minLat) minLat = lat
        if (lng > maxLng) maxLng = lng
        if (lat > maxLat) maxLat = lat
      }

      const lngSpan = maxLng - minLng
      const latSpan = maxLat - minLat

      // pontos coincidentes: fitBounds zoomaria pro infinito
      if (lngSpan < COINCIDENT_THRESHOLD && latSpan < COINCIDENT_THRESHOLD) {
        const center: Coords = [(minLng + maxLng) / 2, (minLat + maxLat) / 2]
        flyTo(center, FOCUS_ZOOM, duration)
        return
      }

      cameraRef.current?.fitBounds(
        [maxLng, maxLat],
        [minLng, minLat],
        [pad.top, pad.right, pad.bottom, pad.left],
        duration,
      )
    },
    [flyTo],
  )

  return { cameraRef, mapRef, flyTo, adjustZoom, focusOnEvent, fitToCoords }
}

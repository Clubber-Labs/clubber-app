import { useCallback, useRef, useState } from 'react'
import { BRAZIL_ZOOM, MARKERS_ZOOM_THRESHOLD } from '../constants'

// `showMarkers` só atualiza quando cruza o threshold e `zoomBucket` só no
// zoom inteiro (recluster do supercluster); o zoom contínuo fica em ref pra
// não causar re-render a cada tick da câmera.
export function useMapZoomState() {
  const zoomRef = useRef<number>(BRAZIL_ZOOM)
  const [showMarkers, setShowMarkers] = useState(
    BRAZIL_ZOOM >= MARKERS_ZOOM_THRESHOLD,
  )
  const [zoomBucket, setZoomBucket] = useState(Math.floor(BRAZIL_ZOOM))

  const onCameraZoomChange = useCallback((zoom: number) => {
    zoomRef.current = zoom
    const next = zoom >= MARKERS_ZOOM_THRESHOLD
    setShowMarkers(prev => (prev === next ? prev : next))
    const bucket = Math.floor(zoom)
    setZoomBucket(prev => (prev === bucket ? prev : bucket))
  }, [])

  const getZoom = useCallback(() => zoomRef.current, [])

  return { showMarkers, zoomBucket, onCameraZoomChange, getZoom }
}

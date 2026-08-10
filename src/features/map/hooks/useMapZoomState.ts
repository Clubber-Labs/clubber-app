import { useCallback, useRef, useState } from 'react'
import { BRAZIL_ZOOM } from '../constants'

// `zoomBucket` só atualiza no zoom inteiro (recluster do supercluster); o
// zoom contínuo fica em ref pra não causar re-render a cada tick da câmera.
export function useMapZoomState() {
  const zoomRef = useRef<number>(BRAZIL_ZOOM)
  const [zoomBucket, setZoomBucket] = useState(Math.floor(BRAZIL_ZOOM))

  const onCameraZoomChange = useCallback((zoom: number) => {
    zoomRef.current = zoom
    const bucket = Math.floor(zoom)
    setZoomBucket(prev => (prev === bucket ? prev : bucket))
  }, [])

  const getZoom = useCallback(() => zoomRef.current, [])

  return { zoomBucket, onCameraZoomChange, getZoom }
}

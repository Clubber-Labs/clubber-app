import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type Mapbox from '@rnmapbox/maps'
import { BBOX_DEBOUNCE_MS } from '../constants'
import type { Bbox } from '../services/mapService'

// Captura a área visível do mapa (debounced) sempre que a câmera se move, com
// token de versão pra descartar respostas stale (mapRef resolvendo após unmount).
// Orquestração de I/O extraída da tela (CLAUDE.md: tela fina, efeito no hook).
export function useViewportBbox(mapRef: RefObject<Mapbox.MapView | null>) {
  const [bbox, setBbox] = useState<Bbox | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const versionRef = useRef(0)

  const capture = useCallback(
    async (token: number) => {
      try {
        const bounds = await mapRef.current?.getVisibleBounds()
        if (!bounds) return
        if (versionRef.current !== token) return
        // getVisibleBounds() não garante a ordem dos cantos — normaliza com
        // min/max (bbox cruzando o antimeridiano não se aplica ao app).
        const [[lng1, lat1], [lng2, lat2]] = bounds
        setBbox({
          bboxNorth: Math.max(lat1, lat2),
          bboxSouth: Math.min(lat1, lat2),
          bboxEast: Math.max(lng1, lng2),
          bboxWest: Math.min(lng1, lng2),
        })
      } catch {
        // MapView ainda não montou ou falha nativa — ignora.
      }
    },
    [mapRef],
  )

  const onRegionChange = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const token = versionRef.current
    timerRef.current = setTimeout(() => capture(token), BBOX_DEBOUNCE_MS)
  }, [capture])

  useEffect(
    () => () => {
      versionRef.current++
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  return { bbox, onRegionChange }
}

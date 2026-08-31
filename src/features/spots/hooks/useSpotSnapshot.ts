import { useCallback, useEffect, useState } from 'react'
import {
  cachedSpotSnapshot,
  dropSpotSnapshot,
  spotSnapshotKey,
  takeSpotSnapshot,
} from '../utils/spotSnapshot'

type Params = {
  placeId: string
  latitude: number
  longitude: number
  // Medida do card, conhecida só depois do layout. Enquanto for null a geração
  // espera — snapshot com tamanho chutado sai desalinhado do balão.
  width: number | null
  height: number
}

// Uma retentativa: se o arquivo regerado também falha em carregar, insistir só
// faria o par gerar/errar rodar pra sempre.
const MAX_ATTEMPTS = 2

/**
 * URI do mini-mapa do rolê, gerado uma vez por lugar e reusado por todos os
 * cards que apontam pra ele. `onImageError` cobre o arquivo apagado pelo SO
 * enquanto o app roda: descarta a entrada e manda gerar de novo.
 */
export function useSpotSnapshot({
  placeId,
  latitude,
  longitude,
  width,
  height,
}: Params) {
  const key = spotSnapshotKey(placeId)
  const [uri, setUri] = useState(() => cachedSpotSnapshot(key))
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (uri || !width || attempt >= MAX_ATTEMPTS) return
    let alive = true
    takeSpotSnapshot({ key, latitude, longitude, width, height }).then(next => {
      if (alive && next) setUri(next)
    })
    return () => {
      alive = false
    }
  }, [uri, attempt, key, latitude, longitude, width, height])

  const onImageError = useCallback(() => {
    dropSpotSnapshot(key)
    setUri(null)
    setAttempt(current => current + 1)
  }, [key])

  return { uri, onImageError }
}

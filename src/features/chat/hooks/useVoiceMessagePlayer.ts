import { useCallback, useEffect, useRef } from 'react'
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import { claimPlayback, releasePlayback } from '../lib/audioPlayback'

// Player de uma bolha de nota de voz. Carrega o áudio só no primeiro play (source
// null evita baixar todas as notas da conversa de uma vez); ao tocar, pausa
// qualquer outra nota que esteja tocando; ao desmontar, libera o som (o hook do
// expo-audio já descarta o player automaticamente).
export function useVoiceMessagePlayer(uri: string, durationMs: number) {
  const player = useAudioPlayer(null, { updateInterval: 80 })
  const status = useAudioPlayerStatus(player)
  const loadedRef = useRef(false)

  // Controles estáveis registrados no coordenador (pause é relido do player atual).
  const controlsRef = useRef({ pause: () => player.pause() })
  controlsRef.current.pause = () => player.pause()

  useEffect(() => {
    const controls = controlsRef.current
    return () => releasePlayback(controls)
  }, [])

  // Ao terminar: volta pro início e solta o "ativo" pra UI mostrar play parado.
  useEffect(() => {
    if (!status.didJustFinish) return
    releasePlayback(controlsRef.current)
    player.seekTo(0)
    player.pause()
  }, [status.didJustFinish, player])

  // durationMs (do backend/otimista) é a fonte confiável; status.duration pode ser
  // 0 até carregar.
  const totalMs =
    durationMs > 0 ? durationMs : Math.round(status.duration * 1000)
  const elapsedMs =
    totalMs > 0 ? Math.min(status.currentTime * 1000, totalMs) : 0
  const progress = totalMs > 0 ? elapsedMs / totalMs : 0

  const load = useCallback(() => {
    if (loadedRef.current) return
    player.replace({ uri })
    loadedRef.current = true
  }, [player, uri])

  const toggle = useCallback(() => {
    if (status.playing) {
      player.pause()
      return
    }
    load()
    claimPlayback(controlsRef.current)
    player.play()
  }, [status.playing, player, load])

  const seekToFraction = useCallback(
    (fraction: number) => {
      load()
      const clamped = Math.max(0, Math.min(1, fraction))
      player.seekTo((totalMs / 1000) * clamped)
    },
    [player, load, totalMs],
  )

  return {
    playing: status.playing,
    isLoaded: status.isLoaded,
    progress,
    elapsedMs,
    totalMs,
    toggle,
    seekToFraction,
  }
}

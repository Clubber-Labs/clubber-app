import { useCallback, useEffect, useRef } from 'react'
import {
  useAudioRecorder,
  useAudioRecorderState,
  setAudioModeAsync,
} from 'expo-audio'
import { buildWaveform } from '@/shared/utils/waveform'
import {
  VOICE_RECORDING_OPTIONS,
  MIN_AUDIO_DURATION_MS,
} from '../lib/audioRecording'

export type VoiceNote = { uri: string; durationMs: number; waveform: number[] }

// Orquestra a gravação (modo de áudio, prepare/record/stop) e coleta as amostras
// de nível pra montar a waveform. Decisões puras (normalização/downsample) ficam
// em shared/utils/waveform; aqui é só efeito/lifecycle.
export function useVoiceRecorder() {
  const recorder = useAudioRecorder(VOICE_RECORDING_OPTIONS)
  // Poll a 100ms: timer ao vivo e uma amostra de metering por tick.
  const state = useAudioRecorderState(recorder, 100)

  const samplesRef = useRef<number[]>([])
  const meterRef = useRef<number | undefined>(undefined)
  const durationRef = useRef(0)
  meterRef.current = state.metering
  durationRef.current = state.durationMillis

  // Uma amostra de nível por poll enquanto grava. durationMillis é monotônico, então
  // o efeito dispara a cada tick; metering sai de um ref pra não depender de valor
  // reativo (que poderia repetir e perder amostras). Só coletamos metering real —
  // se o aparelho não fornecer, samples fica vazio e a nota vai sem waveform ([]).
  useEffect(() => {
    if (!state.isRecording) return
    const meter = meterRef.current
    if (typeof meter === 'number' && Number.isFinite(meter)) {
      samplesRef.current.push(meter)
    }
  }, [state.durationMillis, state.isRecording])

  const restoreAudioMode = useCallback(
    () =>
      setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }),
    [],
  )

  const start = useCallback(async () => {
    samplesRef.current = []
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true })
    await recorder.prepareToRecordAsync(VOICE_RECORDING_OPTIONS)
    recorder.record()
  }, [recorder])

  // Para a gravação e devolve a nota; null se ficou curta demais (descartar).
  const finish = useCallback(async (): Promise<VoiceNote | null> => {
    // Captura a duração ANTES do stop: ao parar, o expo-audio zera o contador do
    // recorder e o polling de 100ms sobrescreve durationRef com 0 antes de lermos.
    const durationMs = Math.round(
      Math.max(recorder.getStatus().durationMillis, durationRef.current),
    )
    await recorder.stop()
    await restoreAudioMode()
    // recorder.uri pode vir defasado logo após stop; getStatus().url é a leitura
    // nativa mais fresca do arquivo finalizado.
    const uri = recorder.uri ?? recorder.getStatus().url
    if (!uri || durationMs < MIN_AUDIO_DURATION_MS) return null
    return { uri, durationMs, waveform: buildWaveform(samplesRef.current) }
  }, [recorder, restoreAudioMode])

  // Para e descarta (botão de lixeira). stop pode lançar se já parou — tudo bem.
  const cancel = useCallback(async () => {
    try {
      await recorder.stop()
    } catch {
      // gravação já encerrada; nada a fazer
    }
    await restoreAudioMode()
  }, [recorder, restoreAudioMode])

  return {
    isRecording: state.isRecording,
    durationMs: state.durationMillis,
    samples: samplesRef.current,
    start,
    finish,
    cancel,
  }
}

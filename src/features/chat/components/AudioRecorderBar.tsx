import { useCallback, useEffect, useRef } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { meterToAmplitude } from '@/shared/utils/waveform'
import { formatDuration } from '@/shared/utils/formatDuration'
import { Waveform } from './Waveform'
import { useVoiceRecorder, type VoiceNote } from '../hooks/useVoiceRecorder'
import { MAX_AUDIO_DURATION_MS } from '../lib/audioRecording'

type Props = {
  // Permissão já garantida pela tela antes de montar esta barra.
  onSend: (note: VoiceNote) => void
  onCancel: () => void
}

const LIVE_BARS = 40

// Barra que substitui o input enquanto grava: timer ao vivo, preview da waveform,
// lixeira (descarta) e enviar. Inicia a gravação ao montar e para ao desmontar.
export function AudioRecorderBar({ onSend, onCancel }: Props) {
  const { isRecording, durationMs, samples, start, finish, cancel } =
    useVoiceRecorder()
  const startedRef = useRef(false)
  const closingRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    start().catch(() => onCancel())
  }, [start, onCancel])

  const handleSend = useCallback(async () => {
    if (closingRef.current) return
    closingRef.current = true
    try {
      const note = await finish()
      if (note) onSend(note)
      else onCancel() // curto demais → descarta
    } catch {
      onCancel() // se stop() falhar, fecha a barra sem travar
    }
  }, [finish, onSend, onCancel])

  const handleCancel = useCallback(async () => {
    if (closingRef.current) return
    closingRef.current = true
    await cancel()
    onCancel()
  }, [cancel, onCancel])

  // Auto-encerra no limite de 10min do backend.
  useEffect(() => {
    if (durationMs >= MAX_AUDIO_DURATION_MS) handleSend()
  }, [durationMs, handleSend])

  // Desmontou no meio da gravação (ex.: usuário volta a tela) sem enviar nem
  // cancelar → aborta: para o recorder e restaura o modo de áudio. `cancel` é
  // estável, então a cleanup só roda no unmount real.
  useEffect(() => {
    return () => {
      if (!closingRef.current) cancel()
    }
  }, [cancel])

  const liveValues = samples
    .slice(-LIVE_BARS)
    .map(db => Math.round(meterToAmplitude(db) * 255))

  return (
    <View className="border-t pb-7 px-2 pt-2 border-zinc-900 bg-black">
      <View className="flex-row items-center gap-2 px-3 py-2">
        <Pressable
          onPress={handleCancel}
          className="w-10 h-10 items-center justify-center"
          accessibilityLabel="Cancelar gravação"
        >
          <Ionicons name="trash-outline" size={22} color="#ef4444" />
        </Pressable>

        <View className="flex-1 flex-row items-center gap-2 bg-zinc-900 rounded-2xl px-3 h-10">
          <View className="w-2 h-2 rounded-full bg-red-500" />
          <Text className="text-white text-sm w-12">
            {formatDuration(durationMs)}
          </Text>
          <View className="flex-1 overflow-hidden">
            <Waveform values={liveValues} height={24} color="#a1a1aa" />
          </View>
        </View>

        <Pressable
          onPress={handleSend}
          disabled={!isRecording}
          className="w-10 h-10 items-center justify-center rounded-full bg-violet-600"
          accessibilityLabel="Enviar áudio"
        >
          <Ionicons name="send" size={18} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  )
}

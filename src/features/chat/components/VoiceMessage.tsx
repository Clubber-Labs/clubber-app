import { useRef } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { formatDuration } from '@/shared/utils/formatDuration'
import { Waveform } from './Waveform'
import { useVoiceMessagePlayer } from '../hooks/useVoiceMessagePlayer'
import { LONG_PRESS_DELAY_MS } from '../utils/longPress'
import type { Attachment } from '../types'

type Props = {
  attachment: Attachment
  isMine: boolean
  // Encaminhado da bolha: os Pressables de play/seek engolem o gesto, então o
  // long-press (menu de ações / reagir) precisa ser tratado neles também.
  onLongPress?: () => void
}

// Onda neutra (constante) quando o áudio veio sem waveform — metering pode estar
// indisponível no aparelho na hora da gravação; o backend manda [] nesse caso.
const FALLBACK_WAVEFORM = Array.from(
  { length: 28 },
  (_, i) => 70 + Math.round(Math.abs(Math.sin(i * 0.7)) * 120),
)

// Bolha de reprodução de nota de voz: play/pause, waveform com progresso (tocável
// pra seek) e duração formatada (decorrida ao tocar, total parado).
export function VoiceMessage({ attachment, isMine, onLongPress }: Props) {
  const durationMs = attachment.durationMs ?? 0
  const { playing, progress, elapsedMs, totalMs, toggle, seekToFraction } =
    useVoiceMessagePlayer(attachment.url, durationMs)

  const trackWidthRef = useRef(0)
  const values =
    attachment.waveform && attachment.waveform.length > 0
      ? attachment.waveform
      : FALLBACK_WAVEFORM

  const showElapsed = playing || elapsedMs > 0
  const label = formatDuration(showElapsed ? elapsedMs : totalMs)

  const tint = isMine ? '#ffffff' : '#e4e4e7'
  const baseBar = isMine ? 'rgba(255,255,255,0.4)' : '#52525b'
  const activeBar = isMine ? '#ffffff' : '#a78bfa'

  return (
    <View
      className="flex-row items-center gap-2 py-1 pr-1"
      style={{ minWidth: 200 }}
    >
      <Pressable
        onPress={toggle}
        onLongPress={onLongPress}
        delayLongPress={LONG_PRESS_DELAY_MS}
        className="w-9 h-9 items-center justify-center"
        accessibilityLabel={playing ? 'Pausar áudio' : 'Tocar áudio'}
      >
        <Ionicons name={playing ? 'pause' : 'play'} size={22} color={tint} />
      </Pressable>

      <Pressable
        className="flex-1"
        onLayout={e => (trackWidthRef.current = e.nativeEvent.layout.width)}
        onPress={e => {
          if (trackWidthRef.current > 0) {
            seekToFraction(e.nativeEvent.locationX / trackWidthRef.current)
          }
        }}
        onLongPress={onLongPress}
        delayLongPress={LONG_PRESS_DELAY_MS}
        accessibilityLabel="Barra de progresso do áudio"
      >
        <Waveform
          values={values}
          height={26}
          progress={progress}
          color={baseBar}
          activeColor={activeBar}
        />
      </Pressable>

      <Text className="text-[11px] w-9 text-right" style={{ color: tint }}>
        {label}
      </Text>
    </View>
  )
}

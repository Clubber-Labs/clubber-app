import { Pressable, Image, View, Text, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { formatDuration } from '@/shared/utils/formatDuration'
import { mediaBoxSize } from '../utils/mediaBox'
import { LONG_PRESS_DELAY_MS } from '../utils/longPress'
import type { Attachment } from '../types'
import { colors } from '@/shared/theme'

type Props = {
  attachment: Attachment
  onPress: () => void
  // Encaminhado da bolha: sem isto, este Pressable engole o gesto e o long-press
  // (menu de ações / reagir) só dispara fora do vídeo.
  onLongPress?: () => void
  sending?: boolean
}

// Bolha de vídeo: poster dimensionado pelo aspect-ratio real (com cap 9:16..16:9),
// overlay de play e badge de duração. Enquanto envia (sem thumbnail) → caixa
// escura no aspect-ratio + spinner, mesmo padrão do ImageMessage.
export function VideoMessage({
  attachment,
  onPress,
  onLongPress,
  sending,
}: Props) {
  const { width, height } = mediaBoxSize(attachment.width, attachment.height, {
    maxWidth: 240,
    maxHeight: 320,
    minAspect: 9 / 16,
    maxAspect: 16 / 9,
    fallback: 220,
  })
  const showPoster = !!attachment.thumbnailUrl && !sending

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={LONG_PRESS_DELAY_MS}
      className="rounded-xl overflow-hidden"
      accessibilityLabel="Vídeo"
    >
      {showPoster ? (
        <Image
          source={{ uri: attachment.thumbnailUrl }}
          style={{ width, height }}
          className="bg-surface-high"
          resizeMode="cover"
        />
      ) : (
        <View style={{ width, height }} className="bg-surface-elevated" />
      )}

      {sending ? (
        <View className="absolute inset-0 items-center justify-center bg-background/25">
          <ActivityIndicator color={colors.content} />
        </View>
      ) : (
        <View className="absolute inset-0 items-center justify-center">
          <View className="w-12 h-12 items-center justify-center rounded-full bg-background/50">
            <Ionicons name="play" size={26} color={colors.content} />
          </View>
        </View>
      )}

      {attachment.durationMs != null && !sending && (
        <View className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-background/60">
          <Text className="text-[11px] text-content">
            {formatDuration(attachment.durationMs)}
          </Text>
        </View>
      )}
    </Pressable>
  )
}

import { Pressable, Image, View, Text, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { formatDuration } from '@/shared/utils/formatDuration'
import { mediaBoxSize } from '../utils/mediaBox'
import type { Attachment } from '../types'

type Props = {
  attachment: Attachment
  onPress: () => void
  sending?: boolean
}

// Bolha de vídeo: poster dimensionado pelo aspect-ratio real (com cap 9:16..16:9),
// overlay de play e badge de duração. Enquanto envia (sem thumbnail) → caixa
// escura no aspect-ratio + spinner, mesmo padrão do ImageMessage.
export function VideoMessage({ attachment, onPress, sending }: Props) {
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
      className="rounded-xl overflow-hidden"
      accessibilityLabel="Vídeo"
    >
      {showPoster ? (
        <Image
          source={{ uri: attachment.thumbnailUrl }}
          style={{ width, height }}
          className="bg-zinc-700"
          resizeMode="cover"
        />
      ) : (
        <View style={{ width, height }} className="bg-zinc-800" />
      )}

      {sending ? (
        <View className="absolute inset-0 items-center justify-center bg-black/25">
          <ActivityIndicator color="#ffffff" />
        </View>
      ) : (
        <View className="absolute inset-0 items-center justify-center">
          <View className="w-12 h-12 items-center justify-center rounded-full bg-black/50">
            <Ionicons name="play" size={26} color="#ffffff" />
          </View>
        </View>
      )}

      {attachment.durationMs != null && !sending && (
        <View className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60">
          <Text className="text-[11px] text-white">
            {formatDuration(attachment.durationMs)}
          </Text>
        </View>
      )}
    </Pressable>
  )
}

import { useState } from 'react'
import { Pressable, Image, View, ActivityIndicator } from 'react-native'
import { mediaBoxSize } from '../utils/mediaBox'
import { LONG_PRESS_DELAY_MS } from '../utils/longPress'
import type { Attachment } from '../types'
import { colors } from '@/shared/theme'

type Props = {
  attachment: Attachment
  onPress: () => void
  // Encaminhado da bolha: sem isto, este Pressable engole o gesto e o long-press
  // (menu de ações / reagir) só dispara fora da imagem.
  onLongPress?: () => void
  sending?: boolean
}

export function ImageMessage({
  attachment,
  onPress,
  onLongPress,
  sending,
}: Props) {
  const [loaded, setLoaded] = useState(false)
  // Caixa pelo aspect-ratio real (quando o backend manda width/height) reservada
  // antes da imagem carregar — evita o "pulo" de layout. Fallback 220×220 quando
  // ausente (imagem local otimista, sem dimensões).
  const { width, height } = mediaBoxSize(attachment.width, attachment.height, {
    maxWidth: 240,
    maxHeight: 320,
    fallback: 220,
  })
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={LONG_PRESS_DELAY_MS}
      className="rounded-xl overflow-hidden"
      accessibilityLabel="Imagem"
    >
      <Image
        source={{ uri: attachment.url }}
        style={{ width, height }}
        className="bg-surface-high"
        resizeMode="cover"
        onLoad={() => setLoaded(true)}
      />
      {(!loaded || sending) && (
        <View className="absolute inset-0 items-center justify-center bg-background/25">
          <ActivityIndicator color={colors.content} />
        </View>
      )}
    </Pressable>
  )
}

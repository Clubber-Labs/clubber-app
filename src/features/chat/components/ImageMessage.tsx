import { useState } from 'react'
import { Pressable, Image, View, ActivityIndicator } from 'react-native'
import { mediaBoxSize } from '../utils/mediaBox'
import type { Attachment } from '../types'

type Props = {
  attachment: Attachment
  onPress: () => void
  sending?: boolean
}

export function ImageMessage({ attachment, onPress, sending }: Props) {
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
      className="rounded-xl overflow-hidden"
      accessibilityLabel="Imagem"
    >
      <Image
        source={{ uri: attachment.url }}
        style={{ width, height }}
        className="bg-zinc-700"
        resizeMode="cover"
        onLoad={() => setLoaded(true)}
      />
      {(!loaded || sending) && (
        <View className="absolute inset-0 items-center justify-center bg-black/25">
          <ActivityIndicator color="#ffffff" />
        </View>
      )}
    </Pressable>
  )
}

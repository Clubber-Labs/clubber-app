import { useState } from 'react'
import { Pressable, Image, View, ActivityIndicator } from 'react-native'
import type { Attachment } from '../types'

type Props = {
  attachment: Attachment
  onPress: () => void
  sending?: boolean
}

export function ImageMessage({ attachment, onPress, sending }: Props) {
  const [loaded, setLoaded] = useState(false)
  return (
    <Pressable
      onPress={onPress}
      className="rounded-xl overflow-hidden"
      accessibilityLabel="Imagem"
    >
      <Image
        source={{ uri: attachment.url }}
        style={{ width: 220, height: 220 }}
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

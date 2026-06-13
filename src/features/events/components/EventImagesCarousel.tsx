import { useState } from 'react'
import {
  View,
  Image,
  FlatList,
  Dimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { EventImage } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  images: EventImage[]
  height?: number
}

const SCREEN_WIDTH = Dimensions.get('window').width

export function EventImagesCarousel({ images, height = 224 }: Props) {
  const [index, setIndex] = useState(0)

  if (images.length === 0) {
    return (
      <View
        style={{ height }}
        className="w-full bg-brand-strong items-center justify-center"
      >
        <Ionicons name="calendar" size={56} color={colors.content} />
      </View>
    )
  }

  if (images.length === 1) {
    return (
      <Image
        source={{ uri: images[0].url }}
        style={{ width: SCREEN_WIDTH, height }}
        className="bg-surface-elevated"
        resizeMode="cover"
      />
    )
  }

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const next = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH)
    if (next !== index) setIndex(next)
  }

  return (
    <View>
      <FlatList
        data={images}
        keyExtractor={img => img.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item.url }}
            style={{ width: SCREEN_WIDTH, height }}
            className="bg-surface-elevated"
            resizeMode="cover"
          />
        )}
      />
      <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1.5">
        {images.map((img, i) => (
          <View
            key={img.id}
            className={`w-1.5 h-1.5 rounded-full ${i === index ? 'bg-content' : 'bg-content/40'}`}
          />
        ))}
      </View>
    </View>
  )
}

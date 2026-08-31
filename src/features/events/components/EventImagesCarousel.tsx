import { useState } from 'react'
import {
  View,
  Image,
  FlatList,
  Pressable,
  Dimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native'
import { CalendarBlankIcon } from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import type { EventImage } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  images: EventImage[]
  height?: number
  // O hero do detalhe troca os dots por um contador "1/4" desenhado por ele
  // (precisa do safe area pra se alinhar aos botões flutuantes).
  showDots?: boolean
  onIndexChange?: (index: number) => void
  // Toque na foto — o enquadramento aqui é sempre cover (corta), então quem
  // quiser ver a imagem inteira abre o visualizador em tela cheia.
  onPressImage?: (index: number) => void
}

const SCREEN_WIDTH = Dimensions.get('window').width

export function EventImagesCarousel({
  images,
  height = 224,
  showDots = true,
  onIndexChange,
  onPressImage,
}: Props) {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const next = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH)
    if (next === index) return
    setIndex(next)
    onIndexChange?.(next)
  }

  // Sem handler o Pressable não entra: um responder sem ação só atrapalharia o
  // pan do carrossel e apareceria como botão pro leitor de tela.
  function renderImage(image: EventImage, position: number) {
    const photo = (
      <Image
        source={{ uri: image.url }}
        style={{ width: SCREEN_WIDTH, height }}
        className="bg-surface-elevated"
        resizeMode="cover"
      />
    )
    if (!onPressImage) return photo
    return (
      <Pressable
        onPress={() => onPressImage(position)}
        accessibilityRole="imagebutton"
        accessibilityLabel={t('events.header.expandPhoto')}
      >
        {photo}
      </Pressable>
    )
  }

  if (images.length === 0) {
    return (
      <View
        style={{ height }}
        className="w-full bg-brand-strong items-center justify-center"
      >
        <CalendarBlankIcon size={56} weight="fill" color={colors.content} />
      </View>
    )
  }

  if (images.length === 1) return renderImage(images[0], 0)

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
        renderItem={({ item, index: position }) => renderImage(item, position)}
      />
      {showDots && (
        <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1.5">
          {images.map((img, i) => (
            <View
              key={img.id}
              className={`w-1.5 h-1.5 rounded-full ${i === index ? 'bg-content' : 'bg-content/40'}`}
            />
          ))}
        </View>
      )}
    </View>
  )
}

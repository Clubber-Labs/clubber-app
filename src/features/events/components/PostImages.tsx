import { useEffect, useState } from 'react'
import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  Dimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { ImageViewerModal } from '@/shared/components/ImageViewerModal'
import type { EventImage } from '@/shared/types'

type Props = {
  images: EventImage[]
}

const SCREEN_WIDTH = Dimensions.get('window').width
// Teto de altura: foto retrato inteira empurraria as ações pra fora da tela e
// o feed viraria uma imagem por rolagem.
const MAX_HEIGHT = 500
// Enquadramento assumido até o tamanho real chegar — retrato 4:5 é o que a
// câmera do celular entrega na maioria dos posts, então o salto é o menor
// possível quando o getSize responde.
const FALLBACK_RATIO = 4 / 5

function heightFor(ratio: number): number {
  return Math.min(SCREEN_WIDTH / ratio, MAX_HEIGHT)
}

/**
 * Fotos do post na largura da tela, sem raio e sem margem — o corpo do post é
 * a imagem. Com mais de uma, vira pager com contador e dots; o toque abre o
 * visualizador em tela cheia, que é onde a foto aparece inteira (aqui ela é
 * enquadrada em cover).
 */
export function PostImages({ images }: Props) {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)
  const [expandedUrl, setExpandedUrl] = useState<string | null>(null)
  const [soloRatio, setSoloRatio] = useState<number | null>(null)

  const solo = images.length === 1 ? images[0] : undefined

  // Foto única respeita o enquadramento original (retrato fica alto, panorama
  // fica baixo). No pager isso não vale: alturas diferentes fariam a lista
  // pular a cada página, então lá todas ficam no teto.
  useEffect(() => {
    if (!solo) return
    let active = true
    Image.getSize(
      solo.url,
      (w, h) => {
        if (active && h > 0) setSoloRatio(w / h)
      },
      () => {},
    )
    return () => {
      active = false
    }
  }, [solo])

  if (images.length === 0) return null

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const next = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH)
    setIndex(current => (current === next ? current : next))
  }

  function renderImage(image: EventImage, height: number) {
    return (
      <Pressable
        onPress={() => setExpandedUrl(image.url)}
        accessibilityRole="imagebutton"
        accessibilityLabel={t('events.posts.expandPhoto')}
      >
        <Image
          source={{ uri: image.url }}
          style={{ width: SCREEN_WIDTH, height }}
          className="bg-surface-elevated"
          resizeMode="cover"
        />
      </Pressable>
    )
  }

  return (
    <View>
      {solo ? (
        renderImage(solo, heightFor(soloRatio ?? FALLBACK_RATIO))
      ) : (
        <>
          <FlatList
            data={images}
            keyExtractor={item => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => renderImage(item, MAX_HEIGHT)}
          />
          <View
            className="absolute right-3 top-3 rounded-full bg-background/60 px-2.5 py-1"
            pointerEvents="none"
          >
            <Text className="text-xs font-semibold text-content">
              {`${index + 1}/${images.length}`}
            </Text>
          </View>
          <View
            className="absolute inset-x-0 bottom-3 flex-row justify-center gap-1.5"
            pointerEvents="none"
          >
            {images.map((image, i) => (
              <View
                key={image.id}
                className={`h-1.5 w-1.5 rounded-full ${i === index ? 'bg-content' : 'bg-content/40'}`}
              />
            ))}
          </View>
        </>
      )}

      <ImageViewerModal
        url={expandedUrl}
        onClose={() => setExpandedUrl(null)}
      />
    </View>
  )
}

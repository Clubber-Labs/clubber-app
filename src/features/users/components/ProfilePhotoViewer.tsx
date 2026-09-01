import { useEffect, useMemo, useState } from 'react'
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { DotsThreeIcon, XIcon } from 'phosphor-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { useSwipeToDismiss } from '@/shared/hooks/useSwipeToDismiss'
import { ActionsMenu, type MenuAction } from '@/shared/components/ActionsMenu'
import { useReportFlow } from '@/features/reports/hooks/useReportFlow'
import { ReportReasonSheet } from '@/features/reports/components/ReportReasonSheet'
import { REPORT_TITLE_KEYS } from '@/features/reports/utils/reportLabels'
import type { UserPhoto } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  photos: UserPhoto[]
  // Publicação aberta (null fecha). Abre na primeira imagem dela.
  photoId: string | null
  isOwner: boolean
  onClose: () => void
  onDelete: (photoId: string) => void
  onOpenEvent: (eventId: string) => void
}

// Uma imagem por página: a publicação com várias fotos vira páginas seguidas,
// e o swipe segue direto pra publicação seguinte.
type Slide = {
  key: string
  photoId: string
  url: string
  caption: string | null
  event: { id: string; title: string } | null
  position: number
  count: number
}

function toSlides(photos: UserPhoto[]): Slide[] {
  return photos.flatMap(photo =>
    photo.images.map((image, i) => ({
      key: image.id,
      photoId: photo.id,
      url: image.url,
      caption: photo.caption ?? null,
      event: photo.event ?? null,
      position: i + 1,
      count: photo.images.length,
    })),
  )
}

export function ProfilePhotoViewer({
  photos,
  photoId,
  isOwner,
  onClose,
  onDelete,
  onOpenEvent,
}: Props) {
  const { t } = useTranslation()
  const { width, height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const slides = useMemo(() => toSlides(photos), [photos])
  const initialIndex = Math.max(
    0,
    slides.findIndex(slide => slide.photoId === photoId),
  )
  const [index, setIndex] = useState(initialIndex)
  const [menuOpen, setMenuOpen] = useState(false)
  const report = useReportFlow()
  const { translateY, reset, applyDrag, release, bgStyle } = useSwipeToDismiss()

  useEffect(() => {
    if (!photoId) return
    setIndex(initialIndex)
    reset()
    // Só ao abrir: o índice depois é do swipe, não da lista.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoId, reset])

  // Dismiss só pra baixo; o horizontal fica com a paginação da lista.
  const native = useMemo(() => Gesture.Native(), [])
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY(12)
        .failOffsetX([-12, 12])
        .simultaneousWithExternalGesture(native)
        .onUpdate(e => applyDrag(e.translationY))
        .onEnd(e => release(e.translationY, onClose)),
    [native, applyDrag, release, onClose],
  )
  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const current = slides[index]
  if (!photoId || !current) return null
  const linkedEvent = current.event

  const actions: MenuAction[] = isOwner
    ? [
        {
          label: t('common.delete'),
          destructive: true,
          onPress: () => {
            onClose()
            onDelete(current.photoId)
          },
        },
      ]
    : [
        {
          label: t(REPORT_TITLE_KEYS.photo),
          onPress: () =>
            report.requestReport({ type: 'photo', id: current.photoId }),
        },
      ]

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      {/* Raiz do RNGH: no Android o Modal abre numa Dialog fora da raiz do
          _layout e nenhum gesto daqui de dentro receberia toque. */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View
          className="absolute inset-0 bg-background"
          style={bgStyle}
          pointerEvents="none"
        />
        <GestureDetector gesture={pan}>
          <Animated.View style={[{ flex: 1 }, dragStyle]}>
            <GestureDetector gesture={native}>
              <FlatList
                data={slides}
                horizontal
                pagingEnabled
                bounces={false}
                showsHorizontalScrollIndicator={false}
                initialScrollIndex={initialIndex}
                getItemLayout={(_, i) => ({
                  length: width,
                  offset: width * i,
                  index: i,
                })}
                keyExtractor={slide => slide.key}
                onMomentumScrollEnd={e =>
                  setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
                }
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item.url }}
                    style={{ width, height }}
                    resizeMode="contain"
                  />
                )}
              />
            </GestureDetector>
          </Animated.View>
        </GestureDetector>

        <View
          className="absolute left-0 right-0 flex-row items-center justify-between px-4"
          style={{ top: insets.top + 8 }}
        >
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t('shared.mediaViewer.closeImage')}
            className="h-11 w-11 items-center justify-center rounded-full bg-background/50"
          >
            <XIcon size={22} color={colors.content} />
          </Pressable>
          {current.count > 1 && (
            <Text className="text-[13px] font-semibold text-content-secondary">
              {t('profile.mural.counter', {
                index: current.position,
                total: current.count,
              })}
            </Text>
          )}
          <Pressable
            onPress={() => setMenuOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={t('profile.mural.moreActions')}
            className="h-11 w-11 items-center justify-center rounded-full bg-background/50"
          >
            <DotsThreeIcon size={22} weight="bold" color={colors.content} />
          </Pressable>
        </View>

        {(!!current.caption || !!linkedEvent) && (
          <View
            className="absolute bottom-0 left-0 right-0 bg-background/60 px-5 pt-3"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <Text className="text-sm leading-5 text-content">
              {current.caption}
              {!!linkedEvent && (
                <>
                  {current.caption ? ' · ' : ''}
                  <Text
                    className="font-bold text-content-secondary"
                    accessibilityRole="link"
                    onPress={() => {
                      onClose()
                      onOpenEvent(linkedEvent.id)
                    }}
                  >
                    {linkedEvent.title}
                  </Text>
                </>
              )}
            </Text>
          </View>
        )}

        <ActionsMenu
          visible={menuOpen}
          actions={actions}
          onClose={() => setMenuOpen(false)}
        />
        <ReportReasonSheet
          target={report.target}
          onClose={report.close}
          onSubmit={report.submit}
        />
      </GestureHandlerRootView>
    </Modal>
  )
}

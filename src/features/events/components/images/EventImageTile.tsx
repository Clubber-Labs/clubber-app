import { useEffect } from 'react'
import { Image, Pressable, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { runOnJS } from 'react-native-worklets'
import { XIcon } from 'phosphor-react-native'
import { slotAtPoint, slotPosition } from '../../lib/imageGrid'
import type { GridGeometry } from '../../lib/imageGrid'
import { colors } from '@/shared/theme'

type Props = {
  url: string
  x: number
  y: number
  index: number
  count: number
  geometry: GridGeometry
  isCover: boolean
  active: boolean
  disabled: boolean
  onSetCover: () => void
  onRemove: () => void
  onDragStart: () => void
  onDragOver: (slot: number) => void
  onDragEnd: () => void
}

const SPRING = { damping: 18, stiffness: 220 }
const LIFT_DELAY_MS = 200

export function EventImageTile({
  url,
  x,
  y,
  index,
  count,
  geometry,
  isCover,
  active,
  disabled,
  onSetCover,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
}: Props) {
  const { t } = useTranslation()
  // Posição em repouso. Nasce no lugar certo (nada de tile entrando voando da
  // origem) e daí em diante é sempre mola.
  const positionX = useSharedValue(x)
  const positionY = useSharedValue(y)
  const offsetX = useSharedValue(0)
  const offsetY = useSharedValue(0)
  const originX = useSharedValue(x)
  const originY = useSharedValue(y)
  const dragging = useSharedValue(false)
  const hovered = useSharedValue(index)

  useEffect(() => {
    // Enquanto o dedo está nesta foto, quem manda na posição é o gesto — as
    // outras é que abrem espaço. O destino final entra no onFinalize.
    if (dragging.value) return
    positionX.value = withSpring(x, SPRING)
    positionY.value = withSpring(y, SPRING)
  }, [x, y, positionX, positionY, dragging])

  const drag = Gesture.Pan()
    .enabled(!disabled && count > 1)
    .activateAfterLongPress(LIFT_DELAY_MS)
    .onStart(() => {
      originX.value = x
      originY.value = y
      hovered.value = index
      dragging.value = true
      runOnJS(onDragStart)()
    })
    .onUpdate(event => {
      offsetX.value = event.translationX
      offsetY.value = event.translationY
      const half = geometry.size / 2
      const slot = slotAtPoint(
        originX.value + offsetX.value + half,
        originY.value + offsetY.value + half,
        geometry,
        count,
      )
      if (slot !== hovered.value) {
        hovered.value = slot
        runOnJS(onDragOver)(slot)
      }
    })
    .onFinalize(() => {
      // Sem ativar (toque curto que não virou arraste) não há o que assentar.
      if (!dragging.value) return
      // Passa a posição do dedo pra `position` ANTES da mola: sem isso ela
      // partiria do slot antigo e a foto daria um salto ao soltar.
      positionX.value = originX.value + offsetX.value
      positionY.value = originY.value + offsetY.value
      const home = slotPosition(hovered.value, geometry)
      positionX.value = withSpring(home.x, SPRING)
      positionY.value = withSpring(home.y, SPRING)
      dragging.value = false
      offsetX.value = 0
      offsetY.value = 0
      runOnJS(onDragEnd)()
    })

  const promote = Gesture.Tap()
    .enabled(!disabled && !isCover)
    .onEnd((_event, success) => {
      if (success) runOnJS(onSetCover)()
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: dragging.value
          ? originX.value + offsetX.value
          : positionX.value,
      },
      {
        translateY: dragging.value
          ? originY.value + offsetY.value
          : positionY.value,
      },
      { scale: withSpring(dragging.value ? 1.06 : 1, SPRING) },
    ],
  }))

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: geometry.size,
          height: geometry.size,
          zIndex: active ? 10 : 0,
          elevation: active ? 6 : 0,
        },
        animatedStyle,
      ]}
    >
      <GestureDetector gesture={Gesture.Race(drag, promote)}>
        <View
          accessible
          accessibilityRole="imagebutton"
          accessibilityLabel={
            isCover
              ? t('events.imagesEditor.currentCover')
              : t('events.imagesEditor.setCover')
          }
          onAccessibilityTap={onSetCover}
          className={`flex-1 rounded-xl overflow-hidden bg-surface-elevated border ${
            active ? 'border-content' : 'border-line'
          }`}
        >
          <Image
            source={{ uri: url }}
            className="flex-1"
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
          {isCover && (
            <View className="absolute bottom-1 left-1 rounded bg-background/70 border border-line-strong px-1.5 py-0.5">
              <Text className="text-content text-[9px] font-bold uppercase">
                {t('events.imagePicker.cover')}
              </Text>
            </View>
          )}
        </View>
      </GestureDetector>
      {/* Dentro do tile, não pendurado no canto como no picker do cadastro: com
          8px de respiro entre as fotos, o botão pra fora cairia em cima da
          vizinha — e o Android nem entrega toque a filho fora do pai. */}
      {!active && (
        <Pressable
          onPress={onRemove}
          disabled={disabled}
          hitSlop={4}
          accessibilityLabel={t('events.imagePicker.removePhoto')}
          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-background/70 border border-line-strong items-center justify-center"
        >
          <XIcon size={14} color={colors.contentBright} />
        </Pressable>
      )}
    </Animated.View>
  )
}

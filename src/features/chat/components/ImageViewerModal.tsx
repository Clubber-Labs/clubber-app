import { useEffect } from 'react'
import { Modal, View, Pressable, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

type Props = {
  url: string | null
  onClose: () => void
}

const { width, height } = Dimensions.get('window')

export function ImageViewerModal({ url, onClose }: Props) {
  const scale = useSharedValue(1)
  const savedScale = useSharedValue(1)
  const tx = useSharedValue(0)
  const ty = useSharedValue(0)
  const savedTx = useSharedValue(0)
  const savedTy = useSharedValue(0)

  // Reseta o transform a cada imagem aberta.
  useEffect(() => {
    scale.value = 1
    savedScale.value = 1
    tx.value = 0
    ty.value = 0
    savedTx.value = 0
    savedTy.value = 0
  }, [url, scale, savedScale, tx, ty, savedTx, savedTy])

  const pinch = Gesture.Pinch()
    .onUpdate(e => {
      scale.value = Math.max(1, savedScale.value * e.scale)
    })
    .onEnd(() => {
      savedScale.value = scale.value
    })

  const pan = Gesture.Pan()
    .onUpdate(e => {
      tx.value = savedTx.value + e.translationX
      ty.value = savedTy.value + e.translationY
    })
    .onEnd(() => {
      savedTx.value = tx.value
      savedTy.value = ty.value
    })

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withTiming(1)
      savedScale.value = 1
      tx.value = withTiming(0)
      ty.value = withTiming(0)
      savedTx.value = 0
      savedTy.value = 0
    })

  const composed = Gesture.Simultaneous(pinch, pan, doubleTap)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }))

  if (!url) return null

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black">
        <GestureDetector gesture={composed}>
          <Animated.View className="flex-1 items-center justify-center">
            <Animated.Image
              source={{ uri: url }}
              style={[{ width, height: height * 0.82 }, animatedStyle]}
              resizeMode="contain"
            />
          </Animated.View>
        </GestureDetector>
        <Pressable
          onPress={onClose}
          className="absolute top-12 right-5 w-10 h-10 items-center justify-center bg-black/50 rounded-full"
          accessibilityLabel="Fechar imagem"
        >
          <Ionicons name="close" size={24} color="#ffffff" />
        </Pressable>
      </View>
    </Modal>
  )
}

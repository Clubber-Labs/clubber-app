import { useEffect } from 'react'
import { Modal, Pressable, View } from 'react-native'
import type { ReactNode } from 'react'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { runOnJS } from 'react-native-worklets'

type Props = {
  visible: boolean
  onClose: () => void
  children: ReactNode
  // Escurece o fundo (scrim) atrás da folha. false = fundo transparente — ex.:
  // seletor de criar no mapa, pra não escurecer o mapa. Tap pra fechar mantém.
  dimmed?: boolean
}

// Bottom sheet imperativo simples (dark theme), no espírito do confirm.tsx.
// Tap no backdrop fecha; tap no conteúdo não propaga. Genérico — qualquer feature.
export function SheetModal({ visible, onClose, children }: Props) {
  // Arrastar a alça pra baixo fecha: segue o dedo; além do limiar (ou num flick),
  // fecha — o slide do Modal cuida da saída. Reseta ao reabrir.
  const dragY = useSharedValue(0)
  useEffect(() => {
    if (visible) dragY.value = 0
  }, [visible, dragY])

  const dragGesture = Gesture.Pan()
    .onUpdate(e => {
      dragY.value = Math.max(0, e.translationY)
    })
    .onEnd(e => {
      if (e.translationY > 100 || e.velocityY > 800) runOnJS(onClose)()
      else dragY.value = withSpring(0, { damping: 22, stiffness: 220 })
    })
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dragY.value }],
  }))

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Gestos do RNGH (a ScrollView das rodas no WheelColumn, o GestureDetector
          da alça) não funcionam dentro do <Modal> nativo: ele renderiza numa
          árvore nativa separada, fora do GestureHandlerRootView da raiz do app.
          Reembrulha aqui pra reativar os gestos dentro da folha. */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Pressable className="flex-1 justify-end" onPress={onClose}>
          <Animated.View style={sheetStyle}>
            <Pressable
              className="bg-surface-sunken rounded-t-3xl border-t border-line pb-8 pt-2"
              onPress={() => {}}
            >
              <GestureDetector gesture={dragGesture}>
                <View className="pt-1 pb-2">
                  <View className="w-10 h-1 bg-surface-high rounded-full self-center" />
                </View>
              </GestureDetector>
              {children}
            </Pressable>
          </Animated.View>
        </Pressable>
      </GestureHandlerRootView>
    </Modal>
  )
}

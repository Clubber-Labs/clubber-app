import { useEffect, useMemo } from 'react'
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
import { useKeyboardOverlap } from '../hooks/useKeyboardOverlap'

// Respiro entre o topo do teclado e o conteúdo recuado.
const KEYBOARD_GAP = 16
// Equivalente ao pb-8 que a folha usa sem teclado (safe area do indicador).
const RESTING_BOTTOM = 32

type Props = {
  visible: boolean
  onClose: () => void
  children: ReactNode
  instantExit?: boolean
}

// Bottom sheet imperativo simples (dark theme), no espírito do confirm.tsx.
// Tap no backdrop fecha; tap no conteúdo não propaga. Genérico — qualquer feature.
export function SheetModal({ visible, onClose, children, instantExit }: Props) {
  // Folha com input (nomear grupo, detalhar denúncia) fica ancorada embaixo e
  // sumia atrás do teclado. Aqui, e não em cada consumidor, pra ninguém ter que
  // lembrar. A superfície segue indo até a borda da tela, passando por trás do
  // teclado — quem recua é o conteúdo, via padding.
  //
  // Vale nas duas plataformas desde que o hook passou a ler o inset do IME (ver
  // shared/lib/keyboardTop) — o adjustResize que o RN põe na Dialog do Modal não
  // resolveria, porque o app é edge-to-edge. O Android AQUI DENTRO ainda não foi
  // medido em device: a Dialog tem janela própria, e se o measureInWindow dela
  // não casar com a régua de screen, o recuo sai errado em vez de sair zero.
  const { ref: sheetRef, overlap } = useKeyboardOverlap()

  // Arrastar a alça pra baixo fecha: segue o dedo; além do limiar (ou num flick),
  // fecha — o slide do Modal cuida da saída. Reseta ao reabrir.
  const dragY = useSharedValue(0)
  useEffect(() => {
    if (visible) dragY.value = 0
  }, [visible, dragY])

  const dragGesture = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate(e => {
          dragY.value = Math.max(0, e.translationY)
        })
        .onEnd(e => {
          if (e.translationY > 100 || e.velocityY > 800) runOnJS(onClose)()
          else dragY.value = withSpring(0, { damping: 22, stiffness: 220 })
        }),
    [dragY, onClose],
  )
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dragY.value }],
  }))

  return (
    <Modal
      visible={visible}
      transparent
      animationType={instantExit ? 'none' : 'slide'}
      onRequestClose={onClose}
    >
      {/* No Android o Modal abre numa Dialog própria, fora do
          GestureHandlerRootView do _layout — sem uma raiz aqui, nada de RNGH
          dentro da folha recebe toque (a roda do DatePicker não rolava). */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Pressable className="flex-1 justify-end" onPress={onClose}>
          <Animated.View style={sheetStyle}>
            {/* Folha SÓLIDA em surface (elevação, não sunken): Modal vive em
                janela própria do iOS e blur real é impossível — translucidez
                sem blur deixava o conteúdo de trás conflitar com a folha; o
                hairline faz a separação no espírito do liquid glass. */}
            <Pressable
              ref={sheetRef}
              className="bg-surface rounded-t-3xl border-t border-white/10 pt-2"
              style={{
                paddingBottom:
                  overlap > 0 ? overlap + KEYBOARD_GAP : RESTING_BOTTOM,
              }}
              onPress={() => {}}
            >
              {/* O padding é o alvo de toque: errar a alça pega o conteúdo de
                  baixo, que numa folha com lista rolável rola em vez de fechar.
                  28px é meio-termo deliberado — os 44px de alvo ideal custariam
                  24px de cromo em toda folha do app. */}
              <GestureDetector gesture={dragGesture}>
                <View className="py-3">
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

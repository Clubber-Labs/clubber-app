import type { ComponentProps, ReactNode } from 'react'
import { Modal, View, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import { colors } from '@/shared/theme'

type Props = {
  // Gesto do consumidor (pan de dismiss; pode vir combinado com pinch/double-tap).
  gesture: ComponentProps<typeof GestureDetector>['gesture']
  // Opacidade do fundo preto, vinda do useSwipeToDismiss.
  bgStyle: ComponentProps<typeof Animated.View>['style']
  closeLabel: string
  onClose: () => void
  // Conteúdo animado (imagem, player) que recebe o gesto.
  children: ReactNode
}

// Casca compartilhada dos visualizadores de mídia em tela cheia (imagem, vídeo):
// fundo preto que esmaece, conteúdo dentro de um GestureDetector e o botão de
// fechar. O gesto e o conteúdo animado são do consumidor — esta casca não conhece
// zoom, player nem imagem.
export function MediaViewerModal({
  gesture,
  bgStyle,
  closeLabel,
  onClose,
  children,
}: Props) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1">
        <Animated.View
          className="absolute inset-0 bg-background"
          style={bgStyle}
          pointerEvents="none"
        />
        <GestureDetector gesture={gesture}>{children}</GestureDetector>
        <Pressable
          onPress={onClose}
          className="absolute top-12 right-5 w-10 h-10 items-center justify-center bg-background/50 rounded-full"
          accessibilityLabel={closeLabel}
        >
          <Ionicons name="close" size={24} color={colors.content} />
        </Pressable>
      </View>
    </Modal>
  )
}

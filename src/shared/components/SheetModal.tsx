import { Modal, Pressable, View } from 'react-native'
import type { ReactNode } from 'react'

type Props = {
  visible: boolean
  onClose: () => void
  children: ReactNode
}

// Bottom sheet imperativo simples (dark theme), no espírito do confirm.tsx.
// Tap no backdrop fecha; tap no conteúdo não propaga. Genérico — qualquer feature.
export function SheetModal({ visible, onClose, children }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-background/50 justify-end"
        onPress={onClose}
      >
        <Pressable
          className="bg-surface-sunken rounded-t-3xl border-t border-line pb-8 pt-2"
          onPress={() => {}}
        >
          <View className="w-10 h-1 bg-surface-high rounded-full self-center mb-2" />
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  )
}

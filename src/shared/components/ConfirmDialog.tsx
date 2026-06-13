import { Modal, View, Text, Pressable } from 'react-native'

export type ConfirmOptions = {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

type Props = {
  visible: boolean
  options: ConfirmOptions
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  visible,
  options,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        className="flex-1 bg-background/60 items-center justify-center px-8"
        onPress={onCancel}
      >
        <Pressable
          className="bg-surface border border-line rounded-2xl p-5 w-full max-w-md gap-4"
          onPress={e => e.stopPropagation()}
        >
          <View className="gap-2">
            <Text className="text-content font-bold text-lg">
              {options.title}
            </Text>
            {!!options.message && (
              <Text className="text-content-tertiary text-sm leading-5">
                {options.message}
              </Text>
            )}
          </View>
          <View className="flex-row gap-3">
            <Pressable
              onPress={onCancel}
              className="flex-1 py-3 rounded-xl border border-line-strong items-center"
            >
              <Text className="text-content-secondary font-semibold text-base">
                {options.cancelLabel ?? 'Cancelar'}
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              className={`flex-1 py-3 rounded-xl items-center ${options.destructive ? 'bg-danger-strong' : 'bg-brand'}`}
            >
              <Text className="text-content font-semibold text-base">
                {options.confirmLabel ?? 'Confirmar'}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

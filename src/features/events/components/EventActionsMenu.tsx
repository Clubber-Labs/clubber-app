import { Modal, View, Text, Pressable } from 'react-native'

export type EventAction = {
  label: string
  onPress: () => void
  destructive?: boolean
}

type Props = {
  visible: boolean
  actions: EventAction[]
  onClose: () => void
}

export function EventActionsMenu({ visible, actions, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-background/60 justify-end"
        onPress={onClose}
      >
        <Pressable
          className="bg-surface border-t border-line rounded-t-2xl pb-8"
          onPress={e => e.stopPropagation()}
        >
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-surface-high" />
          </View>
          <View className="py-2">
            {actions.map((action, i) => (
              <Pressable
                key={action.label}
                onPress={() => {
                  onClose()
                  action.onPress()
                }}
                className={`px-6 py-4 ${i > 0 ? 'border-t border-line' : ''}`}
              >
                <Text
                  className={`text-base font-medium ${action.destructive ? 'text-danger-text' : 'text-content'}`}
                >
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={onClose}
            className="mx-4 mt-2 py-3 rounded-xl bg-surface-elevated items-center"
          >
            <Text className="text-content-secondary font-semibold text-base">
              Cancelar
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

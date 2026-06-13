import type { ComponentProps } from 'react'
import { Modal, View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '@/shared/theme'

type IoniconName = ComponentProps<typeof Ionicons>['name']

export type MapsOption = {
  key: string
  label: string
  icon: IoniconName
  onPress: () => void
}

type Props = {
  visible: boolean
  title?: string
  options: MapsOption[]
  onClose: () => void
}

export function MapsChooserSheet({ visible, title, options, onClose }: Props) {
  const insets = useSafeAreaInsets()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-background/60 justify-end"
        onPress={onClose}
      >
        <Pressable
          className="bg-surface border-t border-line rounded-t-3xl px-4 pt-3 gap-1"
          style={{ paddingBottom: insets.bottom + 12 }}
          onPress={e => e.stopPropagation()}
        >
          <View className="self-center w-10 h-1 rounded-full bg-surface-high mb-3" />

          <Text className="text-content-secondary font-semibold text-base px-2">
            Abrir endereço em
          </Text>
          {!!title && (
            <Text
              className="text-content-subtle text-xs px-2 mb-1"
              numberOfLines={2}
            >
              {title}
            </Text>
          )}

          {options.map(option => (
            <Pressable
              key={option.key}
              onPress={option.onPress}
              className="flex-row items-center gap-3 py-3.5 px-2 rounded-xl active:bg-surface-elevated"
            >
              <Ionicons
                name={option.icon}
                size={22}
                color={colors.contentMuted}
              />
              <Text className="text-content text-base font-medium">
                {option.label}
              </Text>
            </Pressable>
          ))}

          <Pressable
            onPress={onClose}
            className="mt-2 py-3.5 rounded-xl border border-line-strong items-center"
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

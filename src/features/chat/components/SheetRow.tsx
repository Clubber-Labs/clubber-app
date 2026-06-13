import { Pressable, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'
import { colors } from '@/shared/theme'

type IconName = ComponentProps<typeof Ionicons>['name']

type Props = {
  icon: IconName
  label: string
  onPress: () => void
  destructive?: boolean
}

export function SheetRow({ icon, label, onPress, destructive }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-5 py-3.5 active:bg-surface"
    >
      <Ionicons
        name={icon}
        size={22}
        color={destructive ? colors.danger : colors.contentSecondary}
      />
      <Text
        className={`text-base ${destructive ? 'text-danger' : 'text-content-bright'}`}
      >
        {label}
      </Text>
    </Pressable>
  )
}

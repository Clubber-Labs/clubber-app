import { Pressable, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'

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
      className="flex-row items-center gap-3 px-5 py-3.5 active:bg-zinc-900"
    >
      <Ionicons
        name={icon}
        size={22}
        color={destructive ? '#ef4444' : '#e4e4e7'}
      />
      <Text
        className={`text-base ${destructive ? 'text-red-500' : 'text-zinc-100'}`}
      >
        {label}
      </Text>
    </Pressable>
  )
}

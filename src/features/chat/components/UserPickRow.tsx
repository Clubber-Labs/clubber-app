import { Pressable, View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { UserAvatar } from '@/shared/components/UserAvatar'
import type { UserMini } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  user: UserMini
  selected: boolean
  onToggle: () => void
}

export function UserPickRow({ user, selected, onToggle }: Props) {
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center gap-3 px-4 py-3 active:bg-surface"
      accessibilityLabel={`${user.name} ${user.lastname}${selected ? ', selecionado' : ''}`}
    >
      <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size={44} />
      <View className="flex-1">
        <Text className="text-content-bright font-semibold text-base">
          {user.name} {user.lastname}
        </Text>
        <Text className="text-content-subtle text-sm">@{user.username}</Text>
      </View>
      <Ionicons
        name={selected ? 'checkmark-circle' : 'ellipse-outline'}
        size={24}
        color={selected ? colors.brandEmphasis : colors.contentFaint}
      />
    </Pressable>
  )
}

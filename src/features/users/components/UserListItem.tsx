import type { ReactNode } from 'react'
import { View, Text, Pressable } from 'react-native'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { useNavigateToProfile } from '../hooks/useNavigateToProfile'
import type { FeedAuthor } from '@/shared/types'

type Props = {
  user: FeedAuthor
  trailing?: ReactNode
}

export function UserListItem({ user, trailing }: Props) {
  const navigateToProfile = useNavigateToProfile()
  const fullName = `${user.name} ${user.lastname}`.trim()

  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <Pressable
        onPress={() => navigateToProfile(user.id)}
        className="flex-row items-center gap-3 flex-1"
        accessibilityLabel={`Ver perfil de ${user.username}`}
      >
        <UserAvatar name={fullName} avatarUrl={user.avatarUrl} size={44} />
        <View className="flex-1">
          <Text className="text-content font-semibold text-sm">{fullName}</Text>
          <Text className="text-content-muted text-xs">@{user.username}</Text>
        </View>
      </Pressable>
      {trailing}
    </View>
  )
}

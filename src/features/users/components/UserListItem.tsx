import type { ReactNode } from 'react'
import { View, Text } from 'react-native'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { ProfileLink } from './ProfileLink'
import type { FeedAuthor } from '@/shared/types'

type Props = {
  user: FeedAuthor
  trailing?: ReactNode
}

export function UserListItem({ user, trailing }: Props) {
  const fullName = `${user.name} ${user.lastname}`.trim()

  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <ProfileLink
        userId={user.id}
        username={user.username}
        className="flex-row items-center gap-3 flex-1"
      >
        <UserAvatar name={fullName} avatarUrl={user.avatarUrl} size={44} />
        <View className="flex-1">
          <Text className="text-content font-semibold text-sm">{fullName}</Text>
          <Text className="text-content-muted text-xs">@{user.username}</Text>
        </View>
      </ProfileLink>
      {trailing}
    </View>
  )
}

import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { FollowButton } from './FollowButton'
import { useFollowUser } from '../hooks/useFollowUser'
import { useNavigateToProfile } from '../hooks/useNavigateToProfile'
import { useAuthStore } from '@/features/auth/store/authStore'
import {
  hasFullProfile,
  type SearchUserItem,
} from '../schemas/searchUserSchema'
import { colors } from '@/shared/theme'

type Props = {
  user: SearchUserItem
}

export function UserSearchCard({ user }: Props) {
  const viewerId = useAuthStore(s => s.userId)
  const navigateToProfile = useNavigateToProfile()
  const { follow, unfollow } = useFollowUser(user.id)

  const isOwn = user.id === viewerId
  const fullName = `${user.name} ${user.lastname}`.trim()
  const showLock = user.isPrivate && !isOwn
  const bio = hasFullProfile(user) ? user.bio : null

  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <Pressable
        onPress={() => navigateToProfile(user.id)}
        className="flex-row items-center gap-3 flex-1"
        accessibilityLabel={`Ver perfil de ${user.username}`}
      >
        <UserAvatar name={fullName} avatarUrl={user.avatarUrl} size={48} />
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5">
            <Text
              className="text-content font-semibold text-sm"
              numberOfLines={1}
            >
              {fullName}
            </Text>
            {showLock && (
              <Ionicons
                name="lock-closed"
                size={12}
                color={colors.contentMuted}
              />
            )}
          </View>
          <Text className="text-content-subtle text-xs" numberOfLines={1}>
            @{user.username}
          </Text>
          {!!bio && (
            <Text
              className="text-content-muted text-xs mt-0.5"
              numberOfLines={1}
            >
              {bio}
            </Text>
          )}
        </View>
      </Pressable>
      <View>
        {isOwn ? (
          <Text className="text-content-subtle text-sm">Você</Text>
        ) : (
          <FollowButton
            status={user.followStatus}
            loading={follow.isPending || unfollow.isPending}
            onFollow={() => follow.mutate()}
            onUnfollow={() => unfollow.mutate()}
          />
        )}
      </View>
    </View>
  )
}

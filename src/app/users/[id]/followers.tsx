import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useFollowers } from '@/features/follows/hooks/useFollowList'
import { RemoveFollowerButton } from '@/features/follows/components/RemoveFollowerButton'
import { UserListScreen } from '@/features/users/components/UserListScreen'

export default function FollowersScreen() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()
  const viewerId = useAuthStore(s => s.userId)
  const isOwn = !!viewerId && viewerId === id
  const query = useFollowers(id)

  return (
    <UserListScreen
      query={query}
      emptyMessage={t('users.list.noFollowers')}
      renderTrailing={
        isOwn
          ? user => (
              <RemoveFollowerButton
                viewerId={viewerId}
                followerId={user.id}
                followerUsername={user.username}
              />
            )
          : undefined
      }
    />
  )
}

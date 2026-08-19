import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useFollowing } from '@/features/follows/hooks/useFollowList'
import { UnfollowListButton } from '@/features/follows/components/UnfollowListButton'
import { UserListScreen } from '@/features/users/components/UserListScreen'

export default function FollowingScreen() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()
  const viewerId = useAuthStore(s => s.userId)
  const isOwn = !!viewerId && viewerId === id
  const query = useFollowing(id)

  return (
    <UserListScreen
      query={query}
      emptyMessage={t('users.list.notFollowing')}
      renderTrailing={
        isOwn
          ? user => (
              <UnfollowListButton
                viewerId={viewerId}
                targetId={user.id}
                targetUsername={user.username}
              />
            )
          : undefined
      }
    />
  )
}

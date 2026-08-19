import { useFollowRequests } from '@/features/follows/hooks/useFollowRequests'
import { useTranslation } from 'react-i18next'
import { FollowRequestActions } from '@/features/follows/components/FollowRequestActions'
import { UserListScreen } from '@/features/users/components/UserListScreen'

export default function FollowRequestsScreen() {
  const { t } = useTranslation()
  const query = useFollowRequests()

  return (
    <UserListScreen
      query={query}
      emptyMessage={t('users.list.noRequests')}
      renderTrailing={user => <FollowRequestActions followerId={user.id} />}
    />
  )
}

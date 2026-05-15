import { useFollowRequests } from '@/features/follows/hooks/useFollowRequests'
import { FollowRequestActions } from '@/features/follows/components/FollowRequestActions'
import { UserListScreen } from '@/features/users/components/UserListScreen'

export default function FollowRequestsScreen() {
  const query = useFollowRequests()

  return (
    <UserListScreen
      query={query}
      emptyMessage="Nenhuma solicitação pendente."
      renderTrailing={user => <FollowRequestActions followerId={user.id} />}
    />
  )
}

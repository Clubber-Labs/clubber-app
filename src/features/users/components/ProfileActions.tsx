import { View } from 'react-native'
import { FollowButton } from './FollowButton'
import { MessageButton } from './MessageButton'
import { ProfileMoreButton } from './ProfileMoreButton'
import type { UserProfile } from '@/shared/types'

type Props = {
  profile: UserProfile
  followLoading: boolean
  onFollow: () => void
  onUnfollow: () => void
  // Ausente quando a pré-validação (perfil privado sem follow mútuo) nega.
  onMessage?: () => void
  messageLoading?: boolean
}

// Linha de ações do perfil de outra pessoa: Seguir (ocupa o que sobra),
// Mensagem e ⋯. Todas pílulas/círculos — "toca e age".
export function ProfileActions({
  profile,
  followLoading,
  onFollow,
  onUnfollow,
  onMessage,
  messageLoading,
}: Props) {
  return (
    <View className="flex-row items-center gap-2">
      <View className="flex-1">
        <FollowButton
          status={profile.followStatus ?? null}
          followedAt={profile.followedAt}
          loading={followLoading}
          onFollow={onFollow}
          onUnfollow={onUnfollow}
        />
      </View>
      {onMessage && (
        <MessageButton onPress={onMessage} loading={messageLoading} />
      )}
      <ProfileMoreButton profile={profile} />
    </View>
  )
}

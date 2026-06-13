import { Pressable, Text, ActivityIndicator } from 'react-native'
import { useUnfollowFromList } from '../hooks/useUnfollowFromList'
import { useConfirm } from '@/shared/lib/confirm'
import { colors } from '@/shared/theme'

type Props = {
  viewerId: string
  targetId: string
  targetUsername: string
}

export function UnfollowListButton({
  viewerId,
  targetId,
  targetUsername,
}: Props) {
  const unfollow = useUnfollowFromList(viewerId)
  const confirm = useConfirm()

  async function handlePress() {
    const ok = await confirm({
      title: 'Deixar de seguir',
      message: `Deseja deixar de seguir @${targetUsername}?`,
      confirmLabel: 'Deixar de seguir',
      destructive: true,
    })
    if (ok) unfollow.mutate(targetId)
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={unfollow.isPending}
      className="px-3 py-1.5 rounded-lg border border-line-strong"
      accessibilityLabel={`Deixar de seguir @${targetUsername}`}
    >
      {unfollow.isPending ? (
        <ActivityIndicator size="small" color={colors.contentMuted} />
      ) : (
        <Text className="text-content-secondary text-xs font-semibold">
          Seguindo
        </Text>
      )}
    </Pressable>
  )
}

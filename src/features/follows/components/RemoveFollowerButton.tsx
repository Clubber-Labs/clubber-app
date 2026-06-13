import { Pressable, Text, ActivityIndicator } from 'react-native'
import { useRemoveFollower } from '../hooks/useRemoveFollower'
import { useConfirm } from '@/shared/lib/confirm'
import { colors } from '@/shared/theme'

type Props = {
  viewerId: string
  followerId: string
  followerUsername: string
}

export function RemoveFollowerButton({
  viewerId,
  followerId,
  followerUsername,
}: Props) {
  const remove = useRemoveFollower(viewerId)
  const confirm = useConfirm()

  async function handlePress() {
    const ok = await confirm({
      title: 'Remover seguidor',
      message: `Deseja remover @${followerUsername} dos seus seguidores?`,
      confirmLabel: 'Remover',
      destructive: true,
    })
    if (ok) remove.mutate(followerId)
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={remove.isPending}
      className="px-3 py-1.5 rounded-lg border border-line-strong"
      accessibilityLabel={`Remover @${followerUsername} dos seguidores`}
    >
      {remove.isPending ? (
        <ActivityIndicator size="small" color={colors.contentMuted} />
      ) : (
        <Text className="text-content-secondary text-xs font-semibold">
          Remover
        </Text>
      )}
    </Pressable>
  )
}

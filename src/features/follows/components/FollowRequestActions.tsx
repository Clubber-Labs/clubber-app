import { View, Pressable, Text, ActivityIndicator } from 'react-native'
import {
  useAcceptFollowRequest,
  useRejectFollowRequest,
} from '../hooks/useFollowRequests'
import { colors } from '@/shared/theme'

type Props = {
  followerId: string
}

export function FollowRequestActions({ followerId }: Props) {
  const accept = useAcceptFollowRequest()
  const reject = useRejectFollowRequest()
  const pending = accept.isPending || reject.isPending

  if (pending) {
    return (
      <View className="px-3 py-2">
        <ActivityIndicator color={colors.brand} />
      </View>
    )
  }

  return (
    <View className="flex-row gap-2">
      <Pressable
        onPress={() => accept.mutate(followerId)}
        className="bg-brand rounded-lg px-3 py-2"
        accessibilityLabel="Aceitar"
      >
        <Text className="text-content text-xs font-semibold">Aceitar</Text>
      </Pressable>
      <Pressable
        onPress={() => reject.mutate(followerId)}
        className="bg-surface-elevated rounded-lg px-3 py-2 border border-line-strong"
        accessibilityLabel="Recusar"
      >
        <Text className="text-content-secondary text-xs font-semibold">
          Recusar
        </Text>
      </Pressable>
    </View>
  )
}

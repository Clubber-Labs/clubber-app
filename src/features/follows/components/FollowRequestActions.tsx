import { View, Pressable, Text, ActivityIndicator } from 'react-native'
import {
  useAcceptFollowRequest,
  useRejectFollowRequest,
} from '../hooks/useFollowRequests'

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
        <ActivityIndicator color="#7c3aed" />
      </View>
    )
  }

  return (
    <View className="flex-row gap-2">
      <Pressable
        onPress={() => accept.mutate(followerId)}
        className="bg-violet-600 rounded-lg px-3 py-2"
        accessibilityLabel="Aceitar"
      >
        <Text className="text-white text-xs font-semibold">Aceitar</Text>
      </Pressable>
      <Pressable
        onPress={() => reject.mutate(followerId)}
        className="bg-zinc-800 rounded-lg px-3 py-2 border border-zinc-700"
        accessibilityLabel="Recusar"
      >
        <Text className="text-zinc-200 text-xs font-semibold">Recusar</Text>
      </Pressable>
    </View>
  )
}

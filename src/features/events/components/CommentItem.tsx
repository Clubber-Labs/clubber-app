import { View, Text } from 'react-native'
import { formatRelative } from '@/shared/utils/dateFormat'
import type { EventComment } from '@/shared/types'

type Props = {
  comment: EventComment
}

export function CommentItem({ comment }: Props) {
  return (
    <View className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-sm font-semibold text-white">
          {comment.author.name} {comment.author.lastname}
        </Text>
        <Text className="text-xs text-zinc-500">
          {formatRelative(comment.createdAt)}
        </Text>
      </View>
      <Text className="text-sm text-zinc-200">{comment.content}</Text>
    </View>
  )
}

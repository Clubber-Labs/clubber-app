import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useToggleCommentLike } from '../hooks/useComments'
import { useNavigateToProfile } from '@/features/users/hooks/useNavigateToProfile'
import { formatRelative } from '@/shared/utils/dateFormat'
import type { EventComment } from '@/shared/types'

type Props = {
  comment: EventComment
  eventId: string
}

export function CommentItem({ comment, eventId }: Props) {
  const navigateToProfile = useNavigateToProfile()
  const toggleLike = useToggleCommentLike(eventId)

  function handleLike() {
    toggleLike.mutate({
      commentId: comment.id,
      currentlyLiked: comment.userLiked,
    })
  }

  return (
    <View className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
      <View className="flex-row items-center justify-between mb-1">
        <Pressable
          onPress={() => navigateToProfile(comment.author.id)}
          accessibilityLabel={`Ver perfil de ${comment.author.username}`}
        >
          <Text className="text-sm font-semibold text-white">
            {comment.author.name} {comment.author.lastname}
          </Text>
        </Pressable>
        <Text className="text-xs text-zinc-500">
          {formatRelative(comment.createdAt)}
        </Text>
      </View>
      <Text className="text-sm text-zinc-200">{comment.content}</Text>
      <Pressable
        onPress={handleLike}
        className="flex-row items-center gap-1 mt-2 self-start"
        accessibilityLabel={comment.userLiked ? 'Descurtir' : 'Curtir'}
      >
        <Ionicons
          name={comment.userLiked ? 'heart' : 'heart-outline'}
          size={16}
          color={comment.userLiked ? '#ef4444' : '#a1a1aa'}
        />
        {comment.reactionsCount > 0 && (
          <Text
            className={`text-xs ${comment.userLiked ? 'text-red-500' : 'text-zinc-400'}`}
          >
            {comment.reactionsCount}
          </Text>
        )}
      </Pressable>
    </View>
  )
}

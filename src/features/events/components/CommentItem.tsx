import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useToggleCommentLike } from '../hooks/useComments'
import { useNavigateToProfile } from '@/features/users/hooks/useNavigateToProfile'
import { formatRelative } from '@/shared/utils/dateFormat'
import { SwipeableRow } from '@/shared/components/SwipeableRow'
import type { EventComment } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  comment: EventComment
  eventId: string
  // Presente só quando o usuário pode apagar (é o autor) — habilita swipe-apagar.
  onDelete?: () => void
  // Presente só para comentários de terceiros — exibe o atalho de denúncia.
  onReport?: () => void
}

export function CommentItem({ comment, eventId, onDelete, onReport }: Props) {
  const navigateToProfile = useNavigateToProfile()
  const toggleLike = useToggleCommentLike(eventId)

  function handleLike() {
    toggleLike.mutate({
      commentId: comment.id,
      currentlyLiked: comment.userLiked,
    })
  }

  const card = (
    <View className="bg-surface rounded-2xl p-4 border border-line">
      <View className="flex-row items-center justify-between mb-1">
        <Pressable
          onPress={() => navigateToProfile(comment.author.id)}
          accessibilityLabel={`Ver perfil de ${comment.author.username}`}
        >
          <Text className="text-sm font-semibold text-content">
            {comment.author.name} {comment.author.lastname}
          </Text>
        </Pressable>
        <View className="flex-row items-center gap-2">
          <Text className="text-xs text-content-subtle">
            {formatRelative(comment.createdAt)}
          </Text>
          {onReport && (
            <Pressable
              onPress={onReport}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Denunciar comentário"
            >
              <Ionicons
                name="flag-outline"
                size={14}
                color={colors.contentSubtle}
              />
            </Pressable>
          )}
        </View>
      </View>
      <Text className="text-sm text-content-secondary">{comment.content}</Text>
      <Pressable
        onPress={handleLike}
        disabled={toggleLike.isPending}
        className="flex-row items-center gap-1 mt-2 self-start"
        accessibilityLabel={comment.userLiked ? 'Descurtir' : 'Curtir'}
      >
        <Ionicons
          name={comment.userLiked ? 'heart' : 'heart-outline'}
          size={16}
          color={comment.userLiked ? colors.danger : colors.contentMuted}
        />
        {comment.reactionsCount > 0 && (
          <Text
            className={`text-xs ${comment.userLiked ? 'text-danger' : 'text-content-muted'}`}
          >
            {comment.reactionsCount}
          </Text>
        )}
      </Pressable>
    </View>
  )

  if (!onDelete) return card

  return (
    <SwipeableRow
      rightActions={[{ icon: 'trash', label: 'Apagar', onPress: onDelete }]}
    >
      {card}
    </SwipeableRow>
  )
}

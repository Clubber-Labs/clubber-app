import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { FlagIcon, HeartIcon, TrashIcon } from 'phosphor-react-native'
import { useToggleCommentLike } from '../hooks/useComments'
import { useNavigateToProfile } from '@/features/users/hooks/useNavigateToProfile'
import { formatRelative } from '@/shared/utils/dateFormat'
import { useLocale } from '@/shared/hooks/useLocale'
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
  const { t } = useTranslation()
  const locale = useLocale()
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
          accessibilityLabel={t('shared.viewProfile', {
            username: comment.author.username,
          })}
        >
          <Text className="text-sm font-semibold text-content">
            {comment.author.name} {comment.author.lastname}
          </Text>
        </Pressable>
        <View className="flex-row items-center gap-2">
          <Text className="text-xs text-content-subtle">
            {formatRelative(comment.createdAt, locale)}
          </Text>
          {onReport && (
            <Pressable
              onPress={onReport}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('events.comments.report')}
            >
              <FlagIcon size={14} color={colors.contentSubtle} />
            </Pressable>
          )}
        </View>
      </View>
      <Text className="text-sm text-content-secondary">{comment.content}</Text>
      <Pressable
        onPress={handleLike}
        disabled={toggleLike.isPending}
        className="flex-row items-center gap-1 mt-2 self-start"
        accessibilityLabel={
          comment.userLiked
            ? t('events.comments.unlike')
            : t('events.comments.like')
        }
      >
        <HeartIcon
          size={16}
          weight={comment.userLiked ? 'fill' : 'regular'}
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
      rightActions={[
        {
          icon: TrashIcon,
          label: t('events.comments.delete'),
          onPress: onDelete,
        },
      ]}
    >
      {card}
    </SwipeableRow>
  )
}

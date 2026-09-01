import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { CommentItem } from '../CommentItem'
import { CommentReplies } from './CommentReplies'
import type { CommentTarget } from '../../services/eventsService'
import type { EventComment } from '@/shared/types'

type Props = {
  target: CommentTarget
  comment: EventComment
  expanded: boolean
  onToggleExpanded: () => void
  highlightReplyId?: string
  myId: string | null
  isOrganizer: boolean
  onReply: (username: string, parentId: string) => void
  onToggleLike: (
    commentId: string,
    currentlyLiked: boolean,
    parentId?: string,
  ) => void
  onDelete: (commentId: string, mine: boolean, parentId?: string) => void
  onReport: (commentId: string) => void
}

/**
 * Uma raiz e a conversa dela. As ações ficam numa linha discreta embaixo do
 * texto (não em cada avatar), e as respostas abrem AQUI DENTRO em vez de numa
 * tela — a conversa não perde o contexto da lista.
 */
export function CommentThreadGroup({
  target,
  comment,
  expanded,
  onToggleExpanded,
  highlightReplyId,
  myId,
  isOrganizer,
  onReply,
  onToggleLike,
  onDelete,
  onReport,
}: Props) {
  const { t } = useTranslation()
  const mine = comment.author.id === myId

  return (
    <View>
      <CommentItem
        comment={comment}
        onToggleLike={() => onToggleLike(comment.id, comment.userLiked)}
        onDelete={
          mine || isOrganizer ? () => onDelete(comment.id, mine) : undefined
        }
        onReport={mine ? undefined : () => onReport(comment.id)}
      />

      {!comment.pending && (
        <View className="flex-row items-center gap-4 pb-2 pl-[60px]">
          <Pressable
            onPress={() => onReply(comment.author.username, comment.id)}
            hitSlop={6}
            accessibilityRole="button"
          >
            <Text className="text-xs font-semibold text-content-secondary">
              {t('events.comments.reply')}
            </Text>
          </Pressable>

          {comment.repliesCount > 0 && (
            <Pressable
              onPress={onToggleExpanded}
              hitSlop={6}
              accessibilityRole="button"
            >
              <Text className="text-xs font-semibold text-content-secondary">
                {expanded
                  ? t('events.comments.hideReplies')
                  : t('events.comments.viewReplies', {
                      count: comment.repliesCount,
                    })}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {expanded && (
        <CommentReplies
          target={target}
          parentId={comment.id}
          highlightId={highlightReplyId}
          myId={myId}
          isOrganizer={isOrganizer}
          onToggleLike={(id, liked) => onToggleLike(id, liked, comment.id)}
          onDelete={(id, isMine) => onDelete(id, isMine, comment.id)}
          onReport={onReport}
        />
      )}
    </View>
  )
}

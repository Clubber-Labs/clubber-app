import { useEffect } from 'react'
import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { CommentItem } from '../CommentItem'
import { useReplies } from '../../hooks/useComments'
import type { CommentTarget } from '../../services/eventsService'
import { colors } from '@/shared/theme'

type Props = {
  target: CommentTarget
  parentId: string
  // Resposta apontada pela notificação: a lista pagina até achá-la e a tinge.
  highlightId?: string
  myId: string | null
  isOrganizer: boolean
  onToggleLike: (commentId: string, currentlyLiked: boolean) => void
  onDelete: (commentId: string, mine: boolean) => void
  onReport: (commentId: string) => void
}

/**
 * As respostas de UMA raiz, recuadas sob ela. Só monta quando a thread está
 * aberta — é isso que permite uma query por thread sem chamar hook em laço.
 */
export function CommentReplies({
  target,
  parentId,
  highlightId,
  myId,
  isOrganizer,
  onToggleLike,
  onDelete,
  onReport,
}: Props) {
  const { t } = useTranslation()
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useReplies(target, parentId)

  const replies = data?.pages.flatMap(page => page.data) ?? []
  const found = !highlightId || replies.some(r => r.id === highlightId)

  // A apontada pode estar numa página adiante (respostas são cronológicas, e a
  // notificada costuma ser a última). O laço termina quando acaba a lista.
  useEffect(() => {
    if (found) return
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [found, hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) {
    return (
      <View className="py-3 pl-[60px]">
        <ActivityIndicator size="small" color={colors.contentMuted} />
      </View>
    )
  }

  return (
    <View className="pl-11">
      {replies.map(reply => {
        const mine = reply.author.id === myId
        return (
          <CommentItem
            key={reply.id}
            comment={reply}
            highlighted={reply.id === highlightId}
            onToggleLike={() => onToggleLike(reply.id, reply.userLiked)}
            onDelete={
              mine || isOrganizer ? () => onDelete(reply.id, mine) : undefined
            }
            onReport={mine ? undefined : () => onReport(reply.id)}
          />
        )
      })}

      {hasNextPage && (
        <Pressable
          onPress={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          accessibilityRole="button"
          className="flex-row items-center gap-2 px-4 pb-3"
        >
          {isFetchingNextPage && (
            <ActivityIndicator size="small" color={colors.contentMuted} />
          )}
          <Text className="text-xs text-content-subtle">
            {t('events.comments.viewMoreReplies')}
          </Text>
        </Pressable>
      )}
    </View>
  )
}

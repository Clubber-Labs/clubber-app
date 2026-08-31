import { View, Text, ActivityIndicator, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useComments, useDeleteComment } from '../hooks/useComments'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useConfirm } from '@/shared/lib/confirm'
import { useReportFlow } from '@/features/reports/hooks/useReportFlow'
import { ReportReasonSheet } from '@/features/reports/components/ReportReasonSheet'
import { CommentItem } from './CommentItem'
import { colors } from '@/shared/theme'

type Props = {
  eventId: string
  // Organizador do evento — modera comentário de terceiro. Ausente quando quem
  // renderiza não sabe (a lista degrada pra "só apaga o que é seu").
  eventAuthorId?: string
}

/**
 * A conversa aberta: lista plana, um divisor entre linhas, e nada mais. O
 * campo de comentar NÃO mora aqui — ele é o rodapé fixo do card, então segue
 * visível com a seção fechada e não duplica quando ela abre.
 */
export function InlineCommentsSection({ eventId, eventAuthorId }: Props) {
  const { t } = useTranslation()
  const myId = useAuthStore(s => s.userId)
  const confirm = useConfirm()
  const report = useReportFlow()
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useComments(eventId)
  const deleteComment = useDeleteComment(eventId)

  const comments = data?.pages.flatMap(page => page.data) ?? []
  const isOrganizer = !!myId && myId === eventAuthorId

  // Apagar o próprio comentário não pergunta: o sumiço imediato já é a
  // resposta, e desfazer é recomentar. Organizador apagando comentário ALHEIO
  // pergunta — é ação sobre a fala de outra pessoa.
  async function requestDelete(commentId: string, mine: boolean) {
    if (!mine) {
      const ok = await confirm({
        title: t('events.comments.deleteTitle'),
        message: t('events.comments.deleteMessage'),
        confirmLabel: t('events.comments.delete'),
        destructive: true,
      })
      if (!ok) return
    }
    deleteComment.mutate(commentId)
  }

  if (isLoading) {
    return (
      <View className="border-t border-line py-6">
        <ActivityIndicator size="small" color={colors.brandEmphasis} />
      </View>
    )
  }

  return (
    <View className="border-t border-line">
      {comments.length === 0 ? (
        <Text className="px-4 py-6 text-center text-sm text-content-subtle">
          {t('events.comments.empty')}
        </Text>
      ) : (
        comments.map((comment, i) => {
          const mine = comment.author.id === myId
          return (
            <View
              key={comment.id}
              className={i > 0 ? 'border-t border-line' : undefined}
            >
              <CommentItem
                comment={comment}
                eventId={eventId}
                onDelete={
                  mine || isOrganizer
                    ? () => requestDelete(comment.id, mine)
                    : undefined
                }
                onReport={
                  mine
                    ? undefined
                    : () =>
                        report.requestReport({
                          type: 'comment',
                          id: comment.id,
                        })
                }
              />
            </View>
          )
        })
      )}

      {hasNextPage && (
        <Pressable
          onPress={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          accessibilityRole="button"
          className="flex-row items-center gap-2 border-t border-line px-4 py-3"
        >
          {isFetchingNextPage && (
            <ActivityIndicator size="small" color={colors.contentMuted} />
          )}
          <Text className="text-xs text-content-subtle">
            {t('events.comments.viewMore')}
          </Text>
        </Pressable>
      )}

      <ReportReasonSheet
        target={report.target}
        onClose={report.close}
        onSubmit={report.submit}
      />
    </View>
  )
}

import { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { SheetModal } from '@/shared/components/SheetModal'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useConfirm } from '@/shared/lib/confirm'
import { useReportFlow } from '@/features/reports/hooks/useReportFlow'
import { ReportReasonSheet } from '@/features/reports/components/ReportReasonSheet'
import { CommentComposer } from '../CommentComposer'
import { CommentThreadGroup } from './CommentThreadGroup'
import {
  useAddComment,
  useComment,
  useCommentList,
  useDeleteComment,
  useToggleCommentLike,
} from '../../hooks/useComments'
import type { CommentTarget } from '../../services/eventsService'
import type { EventComment } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  visible: boolean
  onClose: () => void
  target: CommentTarget
  // Viewer é o organizador do evento — modera comentário alheio, aqui como no
  // post. Ausente quando quem renderiza não sabe: aí só se apaga o que é seu.
  isOrganizer?: boolean
  // Deep-link de notificação: a raiz a focar e a resposta a destacar. A raiz
  // pode estar em qualquer página da lista, então ela é buscada por id e
  // fixada no topo — paginar até achá-la custaria uma ida por página.
  focusRootId?: string
  focusReplyId?: string
}

type ReplyTo = { username: string; parentId: string } | null

// Fração da tela que a folha ocupa, com teclado ou sem. É o SheetModal que
// segura isso: aqui dentro o conteúdo só flexiona no que sobrar.
const SHEET_HEIGHT_RATIO = 0.65

export function CommentsSheet({
  visible,
  onClose,
  target,
  isOrganizer = false,
  focusRootId,
  focusReplyId,
}: Props) {
  const { t } = useTranslation()
  const { height } = useWindowDimensions()
  const myId = useAuthStore(s => s.userId)
  const confirm = useConfirm()
  const report = useReportFlow()

  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [replyTo, setReplyTo] = useState<ReplyTo>(null)

  const list = useCommentList(target)
  const focusRoot = useComment(target, focusRootId)
  const addComment = useAddComment(target)
  const deleteComment = useDeleteComment(target)
  const toggleLike = useToggleCommentLike(target)

  // A thread apontada já abre expandida — é o que a notificação prometeu.
  useEffect(() => {
    if (focusRootId) setExpanded(prev => new Set(prev).add(focusRootId))
  }, [focusRootId])

  const comments = list.data?.pages.flatMap(page => page.data) ?? []
  const pinned = focusRoot.data
  // Fixada no topo E presente na paginação seria a mesma conversa duas vezes.
  const rest = pinned ? comments.filter(c => c.id !== pinned.id) : comments
  const rows: EventComment[] = pinned ? [pinned, ...rest] : rest

  function toggleExpanded(commentId: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(commentId)) next.delete(commentId)
      else next.add(commentId)
      return next
    })
  }

  // Apagar o próprio comentário não pergunta: o sumiço imediato já é a
  // resposta, e desfazer é recomentar. Apagar comentário ALHEIO pergunta.
  async function requestDelete(
    commentId: string,
    mine: boolean,
    parentId?: string,
  ) {
    if (!mine) {
      const ok = await confirm({
        title: t('events.comments.deleteTitle'),
        message: t('events.comments.deleteMessage'),
        confirmLabel: t('events.comments.delete'),
        destructive: true,
      })
      if (!ok) return
    }
    deleteComment.mutate({ commentId, parentId })
  }

  async function submit(content: string) {
    await addComment.mutateAsync({ content, parentId: replyTo?.parentId })
    // Respondeu: a thread precisa estar aberta pra a resposta aparecer.
    if (replyTo) setExpanded(prev => new Set(prev).add(replyTo.parentId))
    setReplyTo(null)
  }

  return (
    <SheetModal
      visible={visible}
      onClose={onClose}
      height={height * SHEET_HEIGHT_RATIO}
    >
      <View className="flex-1">
        <Text className="pb-3 text-center text-sm font-bold text-content">
          {t('events.comments.sheetTitle')}
        </Text>

        {list.isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.brand} />
          </View>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={comment => comment.id}
            keyboardShouldPersistTaps="handled"
            className="flex-1"
            ItemSeparatorComponent={() => (
              <View className="h-px bg-line-subtle" />
            )}
            renderItem={({ item }) => (
              <CommentThreadGroup
                target={target}
                comment={item}
                expanded={expanded.has(item.id)}
                onToggleExpanded={() => toggleExpanded(item.id)}
                highlightReplyId={
                  item.id === focusRootId ? focusReplyId : undefined
                }
                myId={myId}
                isOrganizer={isOrganizer}
                onReply={(username, parentId) =>
                  setReplyTo({ username, parentId })
                }
                onToggleLike={(commentId, currentlyLiked, parentId) =>
                  toggleLike.mutate({ commentId, currentlyLiked, parentId })
                }
                onDelete={requestDelete}
                onReport={commentId =>
                  report.requestReport({ type: 'comment', id: commentId })
                }
              />
            )}
            ListEmptyComponent={
              <Text className="px-4 py-10 text-center text-sm text-content-subtle">
                {t('events.comments.empty')}
              </Text>
            }
            ListFooterComponent={
              list.isFetchingNextPage ? (
                <ActivityIndicator
                  size="small"
                  color={colors.contentMuted}
                  style={{ marginVertical: 16 }}
                />
              ) : null
            }
            onEndReached={() => list.hasNextPage && list.fetchNextPage()}
            onEndReachedThreshold={0.3}
          />
        )}

        <CommentComposer
          onSubmit={submit}
          replyingTo={replyTo?.username}
          onCancelReply={() => setReplyTo(null)}
          autoFocus={!!replyTo}
          placeholder={
            replyTo ? t('events.comments.replyPlaceholder') : undefined
          }
        />
      </View>

      <ReportReasonSheet
        target={report.target}
        onClose={report.close}
        onSubmit={report.submit}
      />
    </SheetModal>
  )
}

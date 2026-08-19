import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Pressable,
} from 'react-native'
import { PaperPlaneRightIcon } from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import {
  useComments,
  useAddComment,
  useDeleteComment,
} from '../hooks/useComments'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useConfirm } from '@/shared/lib/confirm'
import { useReportFlow } from '@/features/reports/hooks/useReportFlow'
import { ReportReasonSheet } from '@/features/reports/components/ReportReasonSheet'
import { CommentItem } from './CommentItem'
import { colors } from '@/shared/theme'

type Props = {
  eventId: string
}

export function InlineCommentsSection({ eventId }: Props) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const myId = useAuthStore(s => s.userId)
  const confirm = useConfirm()
  const report = useReportFlow()
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useComments(eventId)
  const addComment = useAddComment(eventId)
  const deleteComment = useDeleteComment(eventId)

  const comments = data?.pages.flatMap(page => page.data) ?? []

  async function askDelete(commentId: string) {
    const ok = await confirm({
      title: t('events.comments.deleteTitle'),
      message: t('events.comments.deleteMessage'),
      confirmLabel: t('events.comments.delete'),
      destructive: true,
    })
    if (ok) deleteComment.mutate(commentId)
  }

  function handleSend() {
    const content = text.trim()
    if (!content) return
    addComment.mutate(content, {
      onSuccess: () => setText(''),
    })
  }

  return (
    <View className="border-t border-line bg-surface">
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={colors.brandEmphasis}
          className="py-6"
        />
      ) : (
        <View className="px-4 py-3 gap-2">
          {comments.length === 0 ? (
            <Text className="text-center text-content-subtle text-sm py-3">
              {t('events.comments.empty')}
            </Text>
          ) : (
            comments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                eventId={eventId}
                onDelete={
                  comment.author.id === myId
                    ? () => askDelete(comment.id)
                    : undefined
                }
                onReport={
                  comment.author.id !== myId
                    ? () =>
                        report.requestReport({
                          type: 'comment',
                          id: comment.id,
                        })
                    : undefined
                }
              />
            ))
          )}

          {hasNextPage && (
            <Pressable
              onPress={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="py-2 items-center"
            >
              {isFetchingNextPage ? (
                <ActivityIndicator size="small" color={colors.brandEmphasis} />
              ) : (
                <Text className="text-xs text-brand-text font-medium">
                  {t('events.comments.viewMore')}
                </Text>
              )}
            </Pressable>
          )}
        </View>
      )}

      <View className="flex-row items-end gap-2 px-3 py-2 border-t border-line bg-surface">
        <TextInput
          className="flex-1 border border-line bg-surface-elevated rounded-full px-4 py-2 text-sm text-content max-h-24"
          placeholder={t('events.comments.placeholder')}
          placeholderTextColor={colors.contentSubtle}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
        />
        <Pressable
          onPress={handleSend}
          disabled={!text.trim() || addComment.isPending}
          className={`w-9 h-9 rounded-full items-center justify-center ${text.trim() && !addComment.isPending ? 'bg-brand' : 'bg-surface-higher'}`}
        >
          {addComment.isPending ? (
            <ActivityIndicator size="small" color={colors.content} />
          ) : (
            <PaperPlaneRightIcon
              size={14}
              color={colors.content}
              weight="fill"
            />
          )}
        </Pressable>
      </View>

      <ReportReasonSheet
        target={report.target}
        onClose={report.close}
        onSubmit={report.submit}
      />
    </View>
  )
}

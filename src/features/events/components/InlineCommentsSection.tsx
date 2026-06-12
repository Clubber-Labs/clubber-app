import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Pressable,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
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

type Props = {
  eventId: string
}

export function InlineCommentsSection({ eventId }: Props) {
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
      title: 'Apagar comentário',
      message: 'Tem certeza que deseja apagar este comentário?',
      confirmLabel: 'Apagar',
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
    <View className="border-t border-zinc-800 bg-zinc-900">
      {isLoading ? (
        <ActivityIndicator size="small" color="#8b5cf6" className="py-6" />
      ) : (
        <View className="px-4 py-3 gap-2">
          {comments.length === 0 ? (
            <Text className="text-center text-zinc-500 text-sm py-3">
              Nenhum comentário ainda. Seja o primeiro!
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
                <ActivityIndicator size="small" color="#8b5cf6" />
              ) : (
                <Text className="text-xs text-violet-400 font-medium">
                  Ver mais comentários
                </Text>
              )}
            </Pressable>
          )}
        </View>
      )}

      <View className="flex-row items-end gap-2 px-3 py-2 border-t border-zinc-800 bg-zinc-900">
        <TextInput
          className="flex-1 border border-zinc-800 bg-zinc-800 rounded-full px-4 py-2 text-sm text-white max-h-24"
          placeholder="Escreva um comentário..."
          placeholderTextColor="#71717a"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
        />
        <Pressable
          onPress={handleSend}
          disabled={!text.trim() || addComment.isPending}
          className={`w-9 h-9 rounded-full items-center justify-center ${text.trim() && !addComment.isPending ? 'bg-violet-600' : 'bg-zinc-600'}`}
        >
          {addComment.isPending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons name="send" size={14} color="#ffffff" />
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

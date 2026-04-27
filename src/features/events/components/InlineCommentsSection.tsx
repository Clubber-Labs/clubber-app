import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Pressable,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useComments, useAddComment } from '../hooks/useComments'
import { CommentItem } from './CommentItem'
import { showError } from '@/shared/lib/toast'

type Props = {
  eventId: string
}

export function InlineCommentsSection({ eventId }: Props) {
  const [text, setText] = useState('')
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useComments(eventId)
  const addComment = useAddComment(eventId)

  const comments = data?.pages.flatMap(page => page.data) ?? []

  function handleSend() {
    const content = text.trim()
    if (!content) return
    addComment.mutate(content, {
      onSuccess: () => setText(''),
      onError: showError,
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
              <CommentItem key={comment.id} comment={comment} />
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
    </View>
  )
}

import { useEffect, useMemo, useRef } from 'react'
import {
  FlatList,
  View,
  Text,
  ActivityIndicator,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native'
import { useMessages } from '../hooks/useMessages'
import { MessageBubble } from './MessageBubble'
import { DateSeparator } from './DateSeparator'
import { buildMessageMeta } from '../utils/groupMessages'
import { formatMessageTime } from '../utils/messageTime'
import type { ChatMessage } from '../types'

type Props = {
  conversationId: string
  myId: string
  isGroup: boolean
  // lastReadAt do outro participante (DM) → "Visto" na última mensagem minha lida.
  otherReadAt?: string | null
  onLongPressMessage: (message: ChatMessage) => void
  onPressImage: (url: string) => void
  onRetry: (message: ChatMessage) => void
}

export function MessageList({
  conversationId,
  myId,
  isGroup,
  otherReadAt,
  onLongPressMessage,
  onPressImage,
  onRetry,
}: Props) {
  const { messages, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useMessages(conversationId)

  const meta = useMemo(
    () => buildMessageMeta(messages, myId, isGroup),
    [messages, myId, isGroup],
  )

  // Última (mais nova) mensagem minha já lida pelo outro — recebe o "Visto".
  const seenMessageId = useMemo(() => {
    if (!otherReadAt) return null
    const readTime = new Date(otherReadAt).getTime()
    for (const m of messages) {
      if (
        m.senderId === myId &&
        !m.clientStatus &&
        new Date(m.createdAt).getTime() <= readTime
      ) {
        return m.id
      }
    }
    return null
  }, [messages, otherReadAt, myId])

  const listRef = useRef<FlatList<ChatMessage>>(null)
  const atBottomRef = useRef(true)
  const newestId = messages[0]?.id

  // Auto-scroll pro fim (offset 0 no inverted) quando chega mensagem nova e o
  // usuário já estava no fim.
  useEffect(() => {
    if (atBottomRef.current) {
      listRef.current?.scrollToOffset({ offset: 0, animated: true })
    }
  }, [newestId])

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    atBottomRef.current = e.nativeEvent.contentOffset.y <= 40
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    )
  }

  return (
    <FlatList
      ref={listRef}
      data={messages}
      inverted
      keyExtractor={item => item.id}
      onScroll={onScroll}
      scrollEventThrottle={64}
      contentContainerStyle={{ paddingVertical: 12, flexGrow: 1 }}
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-zinc-400 text-center">Diga olá 👋</Text>
        </View>
      }
      renderItem={({ item, index }) => {
        const m = meta[index]
        const seen =
          item.id === seenMessageId && otherReadAt
            ? `Visto ${formatMessageTime(otherReadAt)}`
            : null
        return (
          <View>
            {m.showDateSeparator && <DateSeparator iso={item.createdAt} />}
            <MessageBubble
              message={item}
              meta={m}
              isGroup={isGroup}
              seenLabel={seen}
              onLongPress={() => onLongPressMessage(item)}
              onPressImage={onPressImage}
              onRetry={() => onRetry(item)}
            />
          </View>
        )
      }}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage()
      }}
      onEndReachedThreshold={0.3}
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator size="small" color="#8b5cf6" className="py-3" />
        ) : null
      }
    />
  )
}

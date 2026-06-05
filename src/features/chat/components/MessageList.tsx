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
import { messageStatus } from '../utils/messageStatus'
import type { ChatMessage, Participant } from '../types'

type Props = {
  conversationId: string
  myId: string
  isGroup: boolean
  // Participantes (com watermarks lastReadAt/lastDeliveredAt) → status (check)
  // de cada mensagem minha.
  participants: Participant[]
  onLongPressMessage: (message: ChatMessage) => void
  onPressImage: (url: string) => void
  onRetry: (message: ChatMessage) => void
  onReplyMessage: (message: ChatMessage) => void
}

export function MessageList({
  conversationId,
  myId,
  isGroup,
  participants,
  onLongPressMessage,
  onPressImage,
  onRetry,
  onReplyMessage,
}: Props) {
  const {
    messages,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useMessages(conversationId)

  const meta = useMemo(
    () => buildMessageMeta(messages, myId, isGroup),
    [messages, myId, isGroup],
  )

  // Outros participantes (sem mim) — base pro status (entregue/lido) das minhas msgs.
  const others = useMemo(
    () => participants.filter(p => p.userId !== myId),
    [participants, myId],
  )

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

  // Rola até a mensagem citada ao tocar na citação — só se já estiver carregada
  // (páginas mais antigas podem não estar; aí é no-op).
  function scrollToMessage(messageId: string) {
    const index = messages.findIndex(m => m.id === messageId)
    if (index >= 0) {
      listRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      })
    }
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
        const status = messageStatus(item, myId, others)
        const replyId = item.replyTo?.id
        return (
          <View>
            {m.showDateSeparator && <DateSeparator iso={item.createdAt} />}
            <MessageBubble
              message={item}
              meta={m}
              isGroup={isGroup}
              status={status}
              onLongPress={() => onLongPressMessage(item)}
              onPressImage={onPressImage}
              onRetry={() => onRetry(item)}
              onReply={() => onReplyMessage(item)}
              onPressReply={
                replyId ? () => scrollToMessage(replyId) : undefined
              }
            />
          </View>
        )
      }}
      onScrollToIndexFailed={info => {
        // Item carregado mas fora da janela montada do FlatList: aproxima via
        // offset estimado e re-tenta o scroll exato no próximo frame.
        listRef.current?.scrollToOffset({
          offset: info.averageItemLength * info.index,
          animated: true,
        })
        setTimeout(() => {
          listRef.current?.scrollToIndex({
            index: info.index,
            viewPosition: 0.5,
            animated: true,
          })
        }, 60)
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

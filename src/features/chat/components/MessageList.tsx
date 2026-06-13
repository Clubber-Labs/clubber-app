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
import { TypingIndicator } from './TypingIndicator'
import { buildMessageMeta } from '../utils/groupMessages'
import { messageStatus } from '../utils/messageStatus'
import { aggregateReactions } from '../utils/reactions'
import type { ChatMessage, Participant } from '../types'
import { colors } from '@/shared/theme'

type Props = {
  conversationId: string
  myId: string
  isGroup: boolean
  // Participantes (com watermarks lastReadAt/lastDeliveredAt) → status (check)
  // de cada mensagem minha.
  participants: Participant[]
  // Rótulo de "digitando…" já resolvido; vazio = ninguém digitando.
  typingLabel: string
  onLongPressMessage: (message: ChatMessage) => void
  onPressImage: (url: string) => void
  onPressVideo: (url: string) => void
  onRetry: (message: ChatMessage) => void
  onReplyMessage: (message: ChatMessage) => void
  onToggleReaction: (message: ChatMessage, emoji: string) => void
}

export function MessageList({
  conversationId,
  myId,
  isGroup,
  participants,
  typingLabel,
  onLongPressMessage,
  onPressImage,
  onPressVideo,
  onRetry,
  onReplyMessage,
  onToggleReaction,
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
        <ActivityIndicator size="large" color={colors.brandEmphasis} />
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
          <Text className="text-content-muted text-center">Diga olá 👋</Text>
        </View>
      }
      ListHeaderComponent={<TypingIndicator label={typingLabel} />}
      renderItem={({ item, index }) => {
        const m = meta[index]
        const status = messageStatus(item, myId, others)
        const replyId = item.replyTo?.id
        const reactions = aggregateReactions(item.reactions, myId)
        return (
          <View>
            {m.showDateSeparator && <DateSeparator iso={item.createdAt} />}
            <MessageBubble
              message={item}
              meta={m}
              isGroup={isGroup}
              status={status}
              reactions={reactions}
              onLongPress={() => onLongPressMessage(item)}
              onPressImage={onPressImage}
              onPressVideo={onPressVideo}
              onRetry={() => onRetry(item)}
              onReply={() => onReplyMessage(item)}
              onPressReply={
                replyId ? () => scrollToMessage(replyId) : undefined
              }
              onToggleReaction={emoji => onToggleReaction(item, emoji)}
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
          <ActivityIndicator
            size="small"
            color={colors.brandEmphasis}
            className="py-3"
          />
        ) : null
      }
    />
  )
}

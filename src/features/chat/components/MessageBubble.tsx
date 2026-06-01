import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { SenderLabel } from './SenderLabel'
import { ImageMessage } from './ImageMessage'
import { formatMessageTime } from '../utils/messageTime'
import type { MessageMeta } from '../utils/groupMessages'
import type { ChatMessage } from '../types'

type Props = {
  message: ChatMessage
  meta: MessageMeta
  isGroup: boolean
  // Texto "Visto HH:MM" (só na última mensagem minha já lida pelo outro, em DM).
  seenLabel?: string | null
  onLongPress: () => void
  onPressImage: (url: string) => void
  onRetry: () => void
}

export function MessageBubble({
  message,
  meta,
  isGroup,
  seenLabel,
  onLongPress,
  onPressImage,
  onRetry,
}: Props) {
  const { isMine } = meta
  const topMargin = meta.startsRun ? 'mt-3' : 'mt-0.5'

  if (message.deletedAt) {
    return (
      <View className={`px-3 ${topMargin} ${isMine ? 'items-end' : 'items-start'}`}>
        <View className="bg-zinc-900 rounded-2xl px-3 py-2 border border-zinc-800">
          <Text className="text-zinc-500 text-sm italic">Mensagem removida</Text>
        </View>
      </View>
    )
  }

  const image = message.attachments[0]
  const imageOnly = !!image && !message.content
  const sending = message.clientStatus === 'sending'
  const failed = message.clientStatus === 'failed'

  const bubble = (
    <Pressable
      onLongPress={onLongPress}
      delayLongPress={300}
      className="max-w-[80%]"
    >
      <View
        className={`rounded-2xl ${isMine ? 'bg-violet-600' : 'bg-zinc-800'} ${imageOnly ? 'p-1' : 'px-3 py-2'}`}
      >
        {image && (
          <ImageMessage
            attachment={image}
            sending={sending}
            onPress={() => onPressImage(image.url)}
          />
        )}
        {message.content ? (
          <Text
            className={`text-[15px] ${isMine ? 'text-white' : 'text-zinc-100'} ${image ? 'mt-1 px-1' : ''}`}
          >
            {message.content}
          </Text>
        ) : null}
        {meta.showTime && (
          <View
            className={`flex-row items-center justify-end gap-1 mt-0.5 ${imageOnly ? 'px-1 pb-0.5' : ''}`}
          >
            {sending && (
              <ActivityIndicator
                size="small"
                color={isMine ? '#ddd6fe' : '#a1a1aa'}
              />
            )}
            <Text
              className={`text-[11px] ${isMine ? 'text-violet-200' : 'text-zinc-500'}`}
            >
              {formatMessageTime(message.createdAt)}
            </Text>
          </View>
        )}
      </View>
      {failed && (
        <Pressable
          onPress={onRetry}
          className="flex-row items-center gap-1 self-end mt-0.5"
          accessibilityLabel="Reenviar mensagem"
        >
          <Ionicons name="alert-circle" size={12} color="#ef4444" />
          <Text className="text-[11px] text-red-500">Falhou · Tentar de novo</Text>
        </Pressable>
      )}
      {isMine && seenLabel && (
        <Text className="text-[11px] text-zinc-500 self-end mt-0.5">
          {seenLabel}
        </Text>
      )}
    </Pressable>
  )

  if (isMine) {
    return <View className={`px-3 ${topMargin} items-end`}>{bubble}</View>
  }

  // Mensagem de outro: gutter de avatar (grupo) + nome no topo do run.
  const showGutter = isGroup
  return (
    <View className={`px-3 ${topMargin}`}>
      {meta.showSenderLabel && (
        <View className="ml-10">
          <SenderLabel name={`${message.sender.name} ${message.sender.lastname}`.trim()} />
        </View>
      )}
      <View className="flex-row items-end gap-2">
        {showGutter &&
          (meta.startsRun ? (
            <UserAvatar
              name={message.sender.name}
              avatarUrl={message.sender.avatarUrl}
              size={28}
            />
          ) : (
            <View style={{ width: 28 }} />
          ))}
        {bubble}
      </View>
    </View>
  )
}

import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { SwipeableRow } from '@/shared/components/SwipeableRow'
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
  // Swipe para a esquerda → responder a esta mensagem.
  onReply: () => void
  // Tocar na citação → rolar até a mensagem original (quando carregada).
  onPressReply?: () => void
}

export function MessageBubble({
  message,
  meta,
  isGroup,
  seenLabel,
  onLongPress,
  onPressImage,
  onRetry,
  onReply,
  onPressReply,
}: Props) {
  const { isMine } = meta
  const topMargin = meta.startsRun ? 'mt-3' : 'mt-0.5'

  if (message.deletedAt) {
    return (
      <View
        className={`px-3 ${topMargin} ${isMine ? 'items-end' : 'items-start'}`}
      >
        <View className="bg-zinc-900 rounded-2xl px-3 py-2 border border-zinc-800">
          <Text className="text-zinc-500 text-sm italic">
            Mensagem removida
          </Text>
        </View>
      </View>
    )
  }

  const image = message.attachments[0]
  const imageOnly = !!image && !message.content
  const sending = message.clientStatus === 'sending'
  const failed = message.clientStatus === 'failed'
  const edited = !!message.editedAt && !message.deletedAt
  const reply = message.replyTo
  const replyText = reply
    ? reply.deletedAt
      ? 'Mensagem removida'
      : (reply.content ?? (reply.attachments?.length ? 'Imagem' : ''))
    : ''

  const bubble = (
    <Pressable
      onLongPress={onLongPress}
      delayLongPress={300}
      className="max-w-[80%]"
    >
      <View
        className={`rounded-2xl ${isMine ? 'bg-violet-600' : 'bg-zinc-800'} ${imageOnly ? 'p-1' : 'px-3 py-2'}`}
      >
        {reply && (
          <Pressable
            onPress={onPressReply}
            className={`mb-1 rounded border-l-2 pl-2 py-0.5 ${isMine ? 'border-violet-200 bg-violet-700/50' : 'border-violet-500 bg-black/25'} ${imageOnly ? 'mx-1 mt-1' : ''}`}
          >
            <Text
              className={`text-[12px] font-semibold ${isMine ? 'text-violet-100' : 'text-violet-300'}`}
              numberOfLines={1}
            >
              {`${reply.sender.name} ${reply.sender.lastname}`.trim()}
            </Text>
            <Text
              className={`text-[12px] ${isMine ? 'text-violet-100' : 'text-zinc-300'}`}
              numberOfLines={1}
            >
              {replyText}
            </Text>
          </Pressable>
        )}
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
        {(meta.showTime || edited) && (
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
              {edited ? 'editada · ' : ''}
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
          <Text className="text-[11px] text-red-500">
            Falhou · Tentar de novo
          </Text>
        </Pressable>
      )}
      {isMine && seenLabel && (
        <Text className="text-[11px] text-zinc-500 self-end mt-0.5">
          {seenLabel}
        </Text>
      )}
    </Pressable>
  )

  // Mensagem de outro: gutter de avatar (grupo) + nome no topo do run.
  const showGutter = isGroup
  const content = isMine ? (
    <View className={`px-3 ${topMargin} items-end bg-black`}>{bubble}</View>
  ) : (
    <View className={`px-3 ${topMargin} bg-black`}>
      {meta.showSenderLabel && (
        <View className="ml-10">
          <SenderLabel
            name={`${message.sender.name} ${message.sender.lastname}`.trim()}
          />
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

  // Só dá pra responder mensagens já persistidas (id real do servidor); bolhas
  // 'sending'/'failed' não. Minhas mensagens (à direita) arrastam direita→
  // esquerda; as de outros (à esquerda), esquerda→direita — cada lado puxa pra
  // dentro.
  if (message.clientStatus) return content
  return (
    <SwipeableRow
      rightTrigger={
        isMine ? { icon: 'arrow-undo-outline', onTrigger: onReply } : undefined
      }
      leftTrigger={
        isMine ? undefined : { icon: 'arrow-undo-outline', onTrigger: onReply }
      }
    >
      {content}
    </SwipeableRow>
  )
}

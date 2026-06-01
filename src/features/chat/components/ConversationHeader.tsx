import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ConversationAvatar } from './ConversationAvatar'
import {
  conversationAvatarUsers,
  conversationTitle,
} from '../utils/conversationDisplay'
import type { Conversation } from '../types'

type Props = {
  conversation: Conversation
  myId: string
  onPressDetails: () => void
}

// Sub-header de conteúdo (avatar + nome → detalhes). A navegação de voltar fica
// no GlobalHeader, igual às demais telas empilhadas (ex: detalhe de evento).
export function ConversationHeader({
  conversation,
  myId,
  onPressDetails,
}: Props) {
  const title = conversationTitle(conversation, myId)
  const other = conversation.participants.find(p => p.userId !== myId)?.user
  const subtitle =
    conversation.type === 'GROUP'
      ? `${conversation.participants.length} participantes`
      : other
        ? `@${other.username}`
        : ''

  return (
    <View className="flex-row items-center gap-1 px-3 py-2 border-b border-zinc-900 bg-black">
      <Pressable
        onPress={onPressDetails}
        className="flex-row items-center gap-2 flex-1"
        accessibilityLabel="Ver detalhes da conversa"
      >
        <ConversationAvatar
          users={conversationAvatarUsers(conversation, myId)}
          type={conversation.type}
          size={38}
        />
        <View className="flex-1">
          <Text numberOfLines={1} className="text-white font-semibold text-base">
            {title}
          </Text>
          {!!subtitle && (
            <Text numberOfLines={1} className="text-zinc-500 text-xs">
              {subtitle}
            </Text>
          )}
        </View>
      </Pressable>
      <Pressable
        onPress={onPressDetails}
        className="w-9 h-9 items-center justify-center"
        accessibilityLabel="Mais opções"
      >
        <Ionicons name="ellipsis-vertical" size={20} color="#e4e4e7" />
      </Pressable>
    </View>
  )
}

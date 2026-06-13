import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ConversationAvatar } from './ConversationAvatar'
import { PresenceDot } from './PresenceDot'
import { usePresence } from '../hooks/usePresence'
import {
  conversationAvatarUsers,
  conversationTitle,
} from '../utils/conversationDisplay'
import { lastSeenLabel } from '../utils/presence'
import type { Conversation } from '../types'
import { colors } from '@/shared/theme'

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
  const isDirect = conversation.type === 'DIRECT'
  const title = conversationTitle(conversation, myId)
  const other = conversation.participants.find(p => p.userId !== myId)?.user
  const presence = usePresence(isDirect ? other?.id : undefined)

  // Grupo: nº de participantes. DM: presença quando conhecida (online / visto
  // por último), senão cai pro @username.
  const subtitle =
    conversation.type === 'GROUP'
      ? `${conversation.participants.length} participantes`
      : presence?.online
        ? 'online'
        : presence?.lastSeenAt
          ? lastSeenLabel(presence.lastSeenAt)
          : other
            ? `@${other.username}`
            : ''

  const showOnlineDot = isDirect && !!presence?.online

  return (
    <View className="flex-row items-center gap-1 px-3 py-2 border-b border-line-subtle bg-background">
      <Pressable
        onPress={onPressDetails}
        className="flex-row items-center gap-2 flex-1"
        accessibilityLabel="Ver detalhes da conversa"
      >
        <View>
          <ConversationAvatar
            users={conversationAvatarUsers(conversation, myId)}
            type={conversation.type}
            size={38}
          />
          {showOnlineDot && (
            <View className="absolute bottom-0 right-0">
              <PresenceDot online size={11} />
            </View>
          )}
        </View>
        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="text-content font-semibold text-base"
          >
            {title}
          </Text>
          {!!subtitle && (
            <Text
              numberOfLines={1}
              className={`text-xs ${showOnlineDot ? 'text-success' : 'text-content-subtle'}`}
            >
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
        <Ionicons
          name="ellipsis-vertical"
          size={20}
          color={colors.contentSecondary}
        />
      </Pressable>
    </View>
  )
}

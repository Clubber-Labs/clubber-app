import { View, Text, Pressable } from 'react-native'
import { ConversationAvatar } from './ConversationAvatar'
import { PresenceDot } from './PresenceDot'
import { UnreadBadge } from '@/shared/components/UnreadBadge'
import { usePresence } from '../hooks/usePresence'
import {
  conversationAvatarUsers,
  conversationTitle,
  isPreviewItalic,
  lastMessagePreview,
} from '../utils/conversationDisplay'
import { formatInboxTime } from '../utils/messageTime'
import type { InboxItem } from '../types'

type Props = {
  item: InboxItem
  myId: string
  onPress: () => void
}

export function ConversationRow({ item, myId, onPress }: Props) {
  const title = conversationTitle(item, myId)
  const preview = lastMessagePreview(item, myId)
  const italic = isPreviewItalic(item)
  const unread = item.unreadCount > 0
  const time = item.lastMessageAt ? formatInboxTime(item.lastMessageAt) : ''

  // Ponto online só em DM (presença é por usuário). Grupo → sem ponto.
  const other =
    item.type === 'DIRECT'
      ? item.participants.find(p => p.userId !== myId)?.user
      : undefined
  const presence = usePresence(other?.id)

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-3 bg-background active:bg-surface"
      accessibilityLabel={`Conversa: ${title}${unread ? `, ${item.unreadCount} não lidas` : ''}`}
    >
      <View>
        <ConversationAvatar
          users={conversationAvatarUsers(item, myId)}
          type={item.type}
        />
        {presence?.online && (
          <View className="absolute bottom-0 right-0">
            <PresenceDot online />
          </View>
        )}
      </View>
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center justify-between">
          <Text
            numberOfLines={1}
            className={`text-base flex-1 mr-2 ${unread ? 'text-content font-bold' : 'text-content-bright font-semibold'}`}
          >
            {title}
          </Text>
          {!!time && (
            <Text
              className={`text-xs ${unread ? 'text-brand-text' : 'text-content-subtle'}`}
            >
              {time}
            </Text>
          )}
        </View>
        <View className="flex-row items-center justify-between">
          <Text
            numberOfLines={1}
            className={`text-sm flex-1 mr-2 ${italic ? 'italic ' : ''}${unread ? 'text-content-secondary font-medium' : 'text-content-subtle'}`}
          >
            {preview}
          </Text>
          <UnreadBadge count={item.unreadCount} />
        </View>
      </View>
    </Pressable>
  )
}

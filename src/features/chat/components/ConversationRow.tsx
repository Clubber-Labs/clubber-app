import { View, Text, Pressable } from 'react-native'
import { ConversationAvatar } from './ConversationAvatar'
import { UnreadBadge } from './UnreadBadge'
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

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-3 active:bg-zinc-900"
      accessibilityLabel={`Conversa: ${title}${unread ? `, ${item.unreadCount} não lidas` : ''}`}
    >
      <ConversationAvatar
        users={conversationAvatarUsers(item, myId)}
        type={item.type}
      />
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center justify-between">
          <Text
            numberOfLines={1}
            className={`text-base flex-1 mr-2 ${unread ? 'text-white font-bold' : 'text-zinc-100 font-semibold'}`}
          >
            {title}
          </Text>
          {!!time && (
            <Text className={`text-xs ${unread ? 'text-violet-400' : 'text-zinc-500'}`}>
              {time}
            </Text>
          )}
        </View>
        <View className="flex-row items-center justify-between">
          <Text
            numberOfLines={1}
            className={`text-sm flex-1 mr-2 ${italic ? 'italic ' : ''}${unread ? 'text-zinc-200 font-medium' : 'text-zinc-500'}`}
          >
            {preview}
          </Text>
          <UnreadBadge count={item.unreadCount} />
        </View>
      </View>
    </Pressable>
  )
}

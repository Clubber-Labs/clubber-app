import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { RoleBadge } from './RoleBadge'
import type { Participant } from '../types'
import { colors } from '@/shared/theme'

type Props = {
  participant: Participant
  isMe: boolean
  canManage: boolean
  onManage: () => void
}

export function ParticipantRow({
  participant,
  isMe,
  canManage,
  onManage,
}: Props) {
  const user = participant.user
  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size={44} />
      <View className="flex-1">
        <Text className="text-content-bright font-semibold text-base">
          {user.name} {user.lastname}
          {isMe ? ' (você)' : ''}
        </Text>
        <Text className="text-content-subtle text-sm">@{user.username}</Text>
      </View>
      {participant.role === 'ADMIN' && <RoleBadge />}
      {canManage && (
        <Pressable
          onPress={onManage}
          className="w-9 h-9 items-center justify-center"
          accessibilityLabel={`Gerenciar ${user.name}`}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={18}
            color={colors.contentMuted}
          />
        </Pressable>
      )}
    </View>
  )
}

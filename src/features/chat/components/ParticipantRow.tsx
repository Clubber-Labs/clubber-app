import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { DotsThreeVerticalIcon } from 'phosphor-react-native'
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
  const { t } = useTranslation()
  const user = participant.user
  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size={44} />
      <View className="flex-1">
        <Text className="text-content-bright font-semibold text-base">
          {user.name} {user.lastname}
          {isMe ? ` ${t('chat.people.you')}` : ''}
        </Text>
        <Text className="text-content-subtle text-sm">@{user.username}</Text>
      </View>
      {participant.role === 'ADMIN' && <RoleBadge />}
      {canManage && (
        <Pressable
          onPress={onManage}
          className="w-9 h-9 items-center justify-center"
          accessibilityLabel={t('chat.group.manageParticipant', {
            name: user.name,
          })}
        >
          <DotsThreeVerticalIcon
            size={18}
            color={colors.contentMuted}
            weight="bold"
          />
        </Pressable>
      )}
    </View>
  )
}

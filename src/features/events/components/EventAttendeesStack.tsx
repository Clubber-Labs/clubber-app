import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ProfileLink } from '@/features/users/components/ProfileLink'
import { UserAvatar } from '@/shared/components/UserAvatar'
import type { FriendAttendance } from '@/shared/types'

type Props = {
  // Participantes em destaque (amigos primeiro). As fotos vêm do avatarUrl.
  attendees: FriendAttendance[]
  totalAttendances: number
  // Diâmetro do avatar — o rodapé do card do feed pede uma versão compacta.
  size?: number
}

const MAX_VISIBLE = 4

export function EventAttendeesStack({
  attendees,
  totalAttendances,
  size = 26,
}: Props) {
  const { t } = useTranslation()
  if (attendees.length === 0) return null

  const visible = attendees.slice(0, MAX_VISIBLE)
  const first = visible[0].user.name
  const summary =
    totalAttendances <= 1
      ? t('events.attendees.oneGoing', { name: first })
      : t('events.attendees.moreGoing', {
          name: first,
          count: totalAttendances - 1,
        })

  return (
    <View className="flex-row items-center gap-2">
      <View className="flex-row">
        {visible.map((a, i) => (
          <View
            key={a.user.id}
            className="rounded-full border-2 border-surface"
            style={{ marginLeft: i === 0 ? 0 : -size * 0.38 }}
          >
            <ProfileLink userId={a.user.id} username={a.user.username}>
              <UserAvatar
                name={a.user.name}
                avatarUrl={a.user.avatarUrl}
                size={size}
              />
            </ProfileLink>
          </View>
        ))}
      </View>
      <Text className="flex-1 text-xs text-content-muted" numberOfLines={1}>
        {summary}
      </Text>
    </View>
  )
}

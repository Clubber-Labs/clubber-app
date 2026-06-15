import { View, Text } from 'react-native'
import { UserAvatar } from '@/shared/components/UserAvatar'
import type { FriendAttendance } from '@/shared/types'

type Props = {
  // Participantes em destaque (amigos primeiro). As fotos vêm do avatarUrl.
  attendees: FriendAttendance[]
  totalAttendances: number
}

const MAX_VISIBLE = 4

export function EventAttendeesStack({ attendees, totalAttendances }: Props) {
  if (attendees.length === 0) return null

  const visible = attendees.slice(0, MAX_VISIBLE)
  const first = visible[0].user.name
  const summary =
    totalAttendances <= 1
      ? `${first} vai`
      : `${first} e mais ${totalAttendances - 1} vão`

  return (
    <View className="flex-row items-center gap-2">
      <View className="flex-row">
        {visible.map((a, i) => (
          <View
            key={a.user.id}
            className="rounded-full border-2 border-surface"
            style={{ marginLeft: i === 0 ? 0 : -10 }}
          >
            <UserAvatar
              name={a.user.name}
              avatarUrl={a.user.avatarUrl}
              size={26}
            />
          </View>
        ))}
      </View>
      <Text className="flex-1 text-xs text-content-muted" numberOfLines={1}>
        {summary}
      </Text>
    </View>
  )
}

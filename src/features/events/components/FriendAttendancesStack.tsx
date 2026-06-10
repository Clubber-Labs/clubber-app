import { View, Text } from 'react-native'
import type { FriendAttendance } from '@/shared/types'

type Props = {
  attendances: FriendAttendance[]
  totalAttendances: number
}

const MAX_VISIBLE = 3

export function FriendAttendancesStack({
  attendances,
  totalAttendances,
}: Props) {
  if (attendances.length === 0) return null

  const visible = attendances.slice(0, MAX_VISIBLE)
  const friendCount = attendances.length
  const others = Math.max(0, totalAttendances - friendCount)

  const summary =
    friendCount === 1
      ? `${visible[0].user.name} vai`
      : `${visible[0].user.name} e mais ${friendCount - 1} ${friendCount - 1 === 1 ? 'amigo' : 'amigos'} vão`

  return (
    <View className="flex-row items-center gap-2">
      <View className="flex-row">
        {visible.map((attendance, i) => (
          <View
            key={attendance.user.id}
            className="w-6 h-6 rounded-full bg-violet-900 items-center justify-center border-2 border-zinc-900"
            style={{ marginLeft: i === 0 ? 0 : -8 }}
          >
            <Text className="text-violet-200 text-[10px] font-semibold">
              {attendance.user.name[0]?.toUpperCase()}
            </Text>
          </View>
        ))}
      </View>
      <Text className="text-xs text-zinc-400 flex-1" numberOfLines={1}>
        {summary}
        {others > 0 ? ` · +${others}` : ''}
      </Text>
    </View>
  )
}

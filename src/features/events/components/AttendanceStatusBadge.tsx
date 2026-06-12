import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { AttendanceType } from '@/shared/types'

type Props = {
  attendance: AttendanceType | null
}

const LABEL: Record<AttendanceType, string> = {
  CONFIRMED: 'Confirmado',
  INTERESTED: 'Interessado',
  NOT_INTERESTED: 'Não vai',
}

const COLOR: Record<
  AttendanceType,
  { bg: string; text: string; icon: string }
> = {
  CONFIRMED: {
    bg: 'bg-violet-900',
    text: 'text-violet-200',
    icon: '#c4b5fd',
  },
  INTERESTED: {
    bg: 'bg-zinc-800',
    text: 'text-zinc-200',
    icon: '#d4d4d8',
  },
  NOT_INTERESTED: {
    bg: 'bg-zinc-800',
    text: 'text-zinc-400',
    icon: '#a1a1aa',
  },
}

const ICON: Record<AttendanceType, 'checkmark' | 'star' | 'close'> = {
  CONFIRMED: 'checkmark',
  INTERESTED: 'star',
  NOT_INTERESTED: 'close',
}

export function AttendanceStatusBadge({ attendance }: Props) {
  if (!attendance) return null
  const color = COLOR[attendance]
  return (
    <View
      className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full ${color.bg}`}
    >
      <Ionicons name={ICON[attendance]} size={12} color={color.icon} />
      <Text className={`text-xs font-semibold ${color.text}`}>
        {LABEL[attendance]}
      </Text>
    </View>
  )
}

import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { AttendanceType } from '@/shared/types'
import { colors } from '@/shared/theme'

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
    bg: 'bg-brand-surface-strong',
    text: 'text-brand-text-bright',
    icon: colors.brandTextStrong,
  },
  INTERESTED: {
    bg: 'bg-surface-elevated',
    text: 'text-content-secondary',
    icon: colors.contentTertiary,
  },
  NOT_INTERESTED: {
    bg: 'bg-surface-elevated',
    text: 'text-content-muted',
    icon: colors.contentMuted,
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

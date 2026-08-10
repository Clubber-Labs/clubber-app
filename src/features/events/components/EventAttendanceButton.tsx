import { View, Text, Pressable } from 'react-native'
import { StarIcon, CheckCircleIcon, XCircleIcon } from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import { useSetAttendance, useCancelAttendance } from '../hooks/useAttendance'
import type { AttendanceType } from '@/shared/types'
import { colors } from '@/shared/theme'

const OPTIONS: { type: AttendanceType; label: string; icon: Icon }[] = [
  { type: 'INTERESTED', label: 'Interessado', icon: StarIcon },
  { type: 'CONFIRMED', label: 'Vou', icon: CheckCircleIcon },
  { type: 'NOT_INTERESTED', label: 'Não vou', icon: XCircleIcon },
]

type Props = {
  eventId: string
  current: AttendanceType | null
}

export function EventAttendanceButton({ eventId, current }: Props) {
  const setAttendance = useSetAttendance(eventId)
  const cancelAttendance = useCancelAttendance(eventId)

  function handlePress(type: AttendanceType) {
    if (current === type) {
      cancelAttendance.mutate()
      return
    }
    setAttendance.mutate(type)
  }

  return (
    <View className="flex-row gap-2">
      {OPTIONS.map(({ type, label, icon: OptionIcon }) => {
        const active = current === type
        return (
          <Pressable
            key={type}
            onPress={() => handlePress(type)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className={`flex-1 items-center justify-center gap-1 rounded-lg border py-3 ${
              active
                ? 'bg-content border-content'
                : 'bg-surface border-line-strong'
            }`}
          >
            <OptionIcon
              size={20}
              color={active ? colors.background : colors.contentSecondary}
            />
            <Text
              className={`text-xs font-bold ${active ? 'text-background' : 'text-content-secondary'}`}
            >
              {label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

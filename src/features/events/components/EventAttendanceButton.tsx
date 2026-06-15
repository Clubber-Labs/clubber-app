import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSetAttendance, useCancelAttendance } from '../hooks/useAttendance'
import type { AttendanceType } from '@/shared/types'
import type { ComponentProps } from 'react'
import { colors } from '@/shared/theme'

type IconName = ComponentProps<typeof Ionicons>['name']

const OPTIONS: { type: AttendanceType; label: string; icon: IconName }[] = [
  { type: 'INTERESTED', label: 'Interessado', icon: 'star-outline' },
  { type: 'CONFIRMED', label: 'Vou', icon: 'checkmark-circle-outline' },
  { type: 'NOT_INTERESTED', label: 'Não vou', icon: 'close-circle-outline' },
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
      {OPTIONS.map(({ type, label, icon }) => {
        const active = current === type
        return (
          <Pressable
            key={type}
            onPress={() => handlePress(type)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className={`flex-1 items-center justify-center gap-1 rounded-lg border py-3 ${
              active ? 'bg-brand border-brand' : 'bg-surface border-line-strong'
            }`}
          >
            <Ionicons
              name={icon}
              size={20}
              color={active ? colors.content : colors.contentSecondary}
            />
            <Text
              className={`text-xs font-bold ${active ? 'text-content' : 'text-content-secondary'}`}
            >
              {label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

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
            className={`flex-1 flex-row items-center justify-center gap-1 py-3 rounded-xl border ${
              active ? 'bg-brand border-brand' : 'bg-surface border-line'
            }`}
          >
            <Ionicons
              name={icon}
              size={18}
              color={active ? colors.content : colors.lineStrong}
            />
            <Text
              className={`text-xs font-semibold ${active ? 'text-content' : 'text-content-secondary'}`}
            >
              {label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

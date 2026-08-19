import { View, Text, Pressable } from 'react-native'
import { StarIcon, CheckCircleIcon, XCircleIcon } from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import type { Icon } from 'phosphor-react-native'
import { useSetAttendance, useCancelAttendance } from '../hooks/useAttendance'
import type { AttendanceType } from '@/shared/types'
import { colors } from '@/shared/theme'

// Constante de módulo guarda a CHAVE (frase pronta congelaria o idioma no boot).
type RsvpLabelKey = `events.rsvp.${'interested' | 'going' | 'notGoing'}`

const OPTIONS: { type: AttendanceType; labelKey: RsvpLabelKey; icon: Icon }[] =
  [
    { type: 'INTERESTED', labelKey: 'events.rsvp.interested', icon: StarIcon },
    { type: 'CONFIRMED', labelKey: 'events.rsvp.going', icon: CheckCircleIcon },
    {
      type: 'NOT_INTERESTED',
      labelKey: 'events.rsvp.notGoing',
      icon: XCircleIcon,
    },
  ]

type Props = {
  eventId: string
  current: AttendanceType | null
}

export function EventAttendanceButton({ eventId, current }: Props) {
  const { t } = useTranslation()
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
      {OPTIONS.map(({ type, labelKey, icon: OptionIcon }) => {
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
              {t(labelKey)}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

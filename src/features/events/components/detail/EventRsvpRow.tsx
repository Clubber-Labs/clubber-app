import { View, Text, Pressable } from 'react-native'
import {
  CheckCircleIcon,
  XCircleIcon,
  UserPlusIcon,
} from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import {
  useSetAttendance,
  useCancelAttendance,
} from '../../hooks/useAttendance'
import type { AttendanceType } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  eventId: string
  current: AttendanceType | null
  // Convidar é ação de primeira classe do detalhe (não vive no menu "..."):
  // vem junto do RSVP porque é a mesma decisão — quem vai, e com quem.
  canInvite: boolean
}

// Estados por PESO, mesma língua do card do feed: pendente = branco cheio;
// respondido = quieto (outline claro no confirmado, fantasma no "não vou").
export function EventRsvpRow({ eventId, current, canInvite }: Props) {
  const { t } = useTranslation()
  const router = useRouter()
  const setAttendance = useSetAttendance(eventId)
  const cancelAttendance = useCancelAttendance(eventId)

  const going = current === 'CONFIRMED'
  const declined = current === 'NOT_INTERESTED'
  const pending = setAttendance.isPending || cancelAttendance.isPending

  function toggle(type: AttendanceType) {
    if (current === type) cancelAttendance.mutate()
    else setAttendance.mutate(type)
  }

  return (
    <View className="flex-row items-center gap-2">
      <Pressable
        onPress={() => toggle('CONFIRMED')}
        disabled={pending}
        accessibilityRole="button"
        accessibilityState={{ selected: going, busy: pending }}
        className={`flex-1 flex-row items-center justify-center gap-2 rounded-full py-3.5 ${
          going
            ? 'border border-white/40'
            : declined
              ? 'border border-line-strong'
              : 'bg-content'
        }`}
      >
        <CheckCircleIcon
          size={18}
          weight={going ? 'fill' : 'regular'}
          color={
            going
              ? colors.content
              : declined
                ? colors.contentMuted
                : colors.background
          }
        />
        <Text
          className={`text-sm font-bold ${
            going
              ? 'text-content'
              : declined
                ? 'text-content-muted'
                : 'text-background'
          }`}
        >
          {going ? t('events.rsvp.confirmed') : t('events.rsvp.going')}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => toggle('NOT_INTERESTED')}
        disabled={pending}
        accessibilityRole="button"
        accessibilityState={{ selected: declined, busy: pending }}
        className={`flex-1 flex-row items-center justify-center gap-2 rounded-full py-3.5 ${
          declined ? 'border border-line' : 'border border-line-strong'
        }`}
      >
        <XCircleIcon
          size={18}
          weight={declined ? 'fill' : 'regular'}
          color={declined ? colors.contentSubtle : colors.contentMuted}
        />
        <Text
          className={`text-sm font-bold ${
            declined ? 'text-content-subtle' : 'text-content-muted'
          }`}
        >
          {t('events.rsvp.notGoing')}
        </Text>
      </Pressable>

      {canInvite && (
        <Pressable
          onPress={() => router.push(`/events/${eventId}/invites`)}
          accessibilityRole="button"
          accessibilityLabel={t('events.invites.cta')}
          className="h-12 w-12 items-center justify-center rounded-full border border-line-strong"
        >
          <UserPlusIcon size={20} color={colors.contentSecondary} />
        </Pressable>
      )}
    </View>
  )
}

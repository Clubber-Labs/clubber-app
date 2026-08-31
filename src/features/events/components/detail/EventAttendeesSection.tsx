import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { EventAttendeesStack } from '../EventAttendeesStack'
import type { EventDetail } from '@/shared/types'

type Props = {
  event: EventDetail
}

// Prova social do evento. Com o evento ao vivo o assunto deixa de ser promessa
// ("quem vai") e passa a ser presença ("quem está lá"), com o check-in à frente
// da confirmação.
export function EventAttendeesSection({ event }: Props) {
  const { t } = useTranslation()
  const attendees = event.topAttendances ?? []
  const confirmed = event._count.attendances
  if (attendees.length === 0 && confirmed === 0) return null

  const live = event.status === 'ONGOING'
  const confirmedLabel = t('events.header.confirmedCount', {
    count: confirmed,
  })
  const count =
    live && event.checkIns
      ? `${t('events.detail.checkIn.count', {
          count: event.checkIns.count,
        })} · ${confirmedLabel}`
      : confirmedLabel

  return (
    <View className="gap-3 border-t border-line pt-4">
      <View className="flex-row items-end justify-between gap-3">
        <Text className="text-content text-base font-extrabold">
          {live ? t('events.detail.whoIsThere') : t('events.header.whoIsGoing')}
        </Text>
        <Text className="text-content-muted text-xs">{count}</Text>
      </View>
      {attendees.length > 0 && (
        <EventAttendeesStack
          attendees={attendees}
          totalAttendances={confirmed}
        />
      )}
    </View>
  )
}

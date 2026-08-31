import { View, Text, Pressable } from 'react-native'
import { CheckCircleIcon, MapPinIcon } from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import { useCheckIn } from '../../hooks/useCheckIn'
import type { EventCheckIns } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  eventId: string
  venueName?: string | null
  checkIns: EventCheckIns
}

// Card do "cheguei" — só entra em cena com o evento ONGOING (a tela decide).
export function EventCheckInCard({ eventId, venueName, checkIns }: Props) {
  const { t } = useTranslation()
  const checkIn = useCheckIn(eventId)

  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5">
      <View className="flex-1">
        <Text className="text-content text-[15px] font-bold" numberOfLines={2}>
          {venueName
            ? t('events.detail.checkIn.prompt', { venue: venueName })
            : t('events.detail.checkIn.promptGeneric')}
        </Text>
        {checkIns.count > 0 && (
          <Text className="text-content-muted mt-0.5 text-xs">
            {t('events.detail.checkIn.peopleCount', { count: checkIns.count })}
          </Text>
        )}
      </View>

      {checkIns.viewerCheckedIn ? (
        <View className="flex-row items-center gap-1.5 rounded-full border border-white/40 px-4 py-2.5">
          <CheckCircleIcon size={16} weight="fill" color={colors.content} />
          <Text className="text-content text-sm font-bold">
            {t('events.detail.checkIn.done')}
          </Text>
        </View>
      ) : (
        <Pressable
          onPress={() => checkIn.mutate()}
          disabled={checkIn.isPending}
          accessibilityRole="button"
          accessibilityState={{ busy: checkIn.isPending }}
          className="flex-row items-center gap-1.5 rounded-full bg-content px-4 py-2.5"
        >
          <MapPinIcon size={16} weight="fill" color={colors.background} />
          <Text className="text-background text-sm font-bold">
            {t('events.detail.checkIn.cta')}
          </Text>
        </Pressable>
      )}
    </View>
  )
}

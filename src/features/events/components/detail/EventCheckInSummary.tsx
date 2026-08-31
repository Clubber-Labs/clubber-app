import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { UserAvatar } from '@/shared/components/UserAvatar'
import type { EventCheckIns } from '@/shared/types'

type Props = {
  checkIns: EventCheckIns
  confirmedCount: number
}

const MAX_AVATARS = 3

// Leitura do autor sobre a casa cheia: quantos já chegaram, de quantos disseram
// que vinham. É placar, não ação — por isso não navega nem convida.
export function EventCheckInSummary({ checkIns, confirmedCount }: Props) {
  const { t } = useTranslation()
  const arrived = (checkIns.top ?? []).slice(0, MAX_AVATARS)

  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5">
      {arrived.length > 0 && (
        <View className="flex-row">
          {arrived.map((attendance, i) => (
            <View
              key={attendance.user.id}
              className="rounded-full border-2 border-surface"
              style={{ marginLeft: i === 0 ? 0 : -10 }}
            >
              <UserAvatar
                name={attendance.user.name}
                avatarUrl={attendance.user.avatarUrl}
                size={30}
              />
            </View>
          ))}
        </View>
      )}
      <View className="flex-1">
        <Text className="text-content text-[15px] font-bold">
          {t('events.detail.checkIn.nowCount', { count: checkIns.count })}
        </Text>
        <Text className="text-content-muted mt-0.5 text-xs">
          {t('events.detail.checkIn.ofConfirmed', { count: confirmedCount })}
        </Text>
      </View>
    </View>
  )
}

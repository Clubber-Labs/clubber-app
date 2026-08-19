import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { CrownIcon } from 'phosphor-react-native'
import type { Subscription, SubscriptionStatus } from '../types'
import { formatDayOfMonthYear } from '@/shared/utils/dateFormat'
import { useLocale } from '@/shared/hooks/useLocale'
import { colors } from '@/shared/theme'

// Chaves, não frases: a constante avalia no import e congelaria o idioma.
const STATUS_LABEL_KEYS = {
  TRIALING: 'billing.status.TRIALING',
  ACTIVE: 'billing.status.ACTIVE',
  PAST_DUE: 'billing.status.PAST_DUE',
  CANCELED: 'billing.status.CANCELED',
  INCOMPLETE: 'billing.status.INCOMPLETE',
  INCOMPLETE_EXPIRED: 'billing.status.INCOMPLETE_EXPIRED',
  UNPAID: 'billing.status.UNPAID',
} as const satisfies Record<SubscriptionStatus, string>

type Props = {
  subscription: Subscription
}

export function SubscriptionCard({ subscription }: Props) {
  const { t } = useTranslation()
  const locale = useLocale()
  const isTrial = subscription.status === 'TRIALING'
  const isPastDue = subscription.status === 'PAST_DUE'

  return (
    <View className="bg-surface border border-line rounded-2xl p-5 gap-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <CrownIcon size={20} color={colors.brandText} />
          <Text className="text-content font-bold text-lg">
            {t('spots.premium.name')}
          </Text>
        </View>
        <View
          className={`px-2.5 py-1 rounded-full ${isPastDue ? 'bg-danger-strong/20' : 'bg-brand/20'}`}
        >
          <Text
            className={`text-xs font-semibold ${isPastDue ? 'text-danger-text' : 'text-brand-text-strong'}`}
          >
            {t(STATUS_LABEL_KEYS[subscription.status])}
          </Text>
        </View>
      </View>

      {isTrial && subscription.trialEndsAt && (
        <Text className="text-content-tertiary text-sm">
          {t('billing.card.trialUntil', {
            date: formatDayOfMonthYear(subscription.trialEndsAt, locale),
          })}
        </Text>
      )}

      {subscription.cancelAtPeriodEnd ? (
        <Text className="text-warning text-sm">
          {t('billing.card.cancelScheduled', {
            date: formatDayOfMonthYear(subscription.currentPeriodEnd, locale),
          })}
        </Text>
      ) : (
        <Text className="text-content-muted text-sm">
          {t(
            isTrial
              ? 'billing.card.firstChargeOn'
              : 'billing.card.nextRenewalOn',
            {
              date: formatDayOfMonthYear(subscription.currentPeriodEnd, locale),
            },
          )}
        </Text>
      )}

      {isPastDue && (
        <Text className="text-danger-text text-sm">
          {t('billing.card.pastDue')}
        </Text>
      )}
    </View>
  )
}

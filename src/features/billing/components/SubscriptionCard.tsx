import { View, Text } from 'react-native'
import { CrownIcon } from 'phosphor-react-native'
import type { Subscription, SubscriptionStatus } from '../types'
import { formatDayOfMonthYear } from '@/shared/utils/dateFormat'
import { useLocale } from '@/shared/hooks/useLocale'
import { colors } from '@/shared/theme'

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  TRIALING: 'Período de teste',
  ACTIVE: 'Ativa',
  PAST_DUE: 'Pagamento pendente',
  CANCELED: 'Cancelada',
  INCOMPLETE: 'Aguardando pagamento',
  INCOMPLETE_EXPIRED: 'Expirada',
  UNPAID: 'Inadimplente',
}

type Props = {
  subscription: Subscription
}

export function SubscriptionCard({ subscription }: Props) {
  const locale = useLocale()
  const isTrial = subscription.status === 'TRIALING'
  const isPastDue = subscription.status === 'PAST_DUE'

  return (
    <View className="bg-surface border border-line rounded-2xl p-5 gap-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <CrownIcon size={20} color={colors.brandText} />
          <Text className="text-content font-bold text-lg">
            Clubber Premium
          </Text>
        </View>
        <View
          className={`px-2.5 py-1 rounded-full ${isPastDue ? 'bg-danger-strong/20' : 'bg-brand/20'}`}
        >
          <Text
            className={`text-xs font-semibold ${isPastDue ? 'text-danger-text' : 'text-brand-text-strong'}`}
          >
            {STATUS_LABEL[subscription.status]}
          </Text>
        </View>
      </View>

      {isTrial && subscription.trialEndsAt && (
        <Text className="text-content-tertiary text-sm">
          Teste grátis até{' '}
          {formatDayOfMonthYear(subscription.trialEndsAt, locale)}.
        </Text>
      )}

      {subscription.cancelAtPeriodEnd ? (
        <Text className="text-warning text-sm">
          Cancelamento agendado: o acesso premium termina em{' '}
          {formatDayOfMonthYear(subscription.currentPeriodEnd, locale)}.
        </Text>
      ) : (
        <Text className="text-content-muted text-sm">
          {isTrial ? 'Primeira cobrança' : 'Próxima renovação'} em{' '}
          {formatDayOfMonthYear(subscription.currentPeriodEnd, locale)}.
        </Text>
      )}

      {isPastDue && (
        <Text className="text-danger-text text-sm">
          Não conseguimos cobrar seu cartão. Atualize o pagamento para manter o
          acesso.
        </Text>
      )}
    </View>
  )
}

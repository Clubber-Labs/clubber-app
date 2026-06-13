import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { Subscription, SubscriptionStatus } from '../types'
import { formatDateBR } from '../utils/formatDateBR'
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
  const isTrial = subscription.status === 'TRIALING'
  const isPastDue = subscription.status === 'PAST_DUE'

  return (
    <View className="bg-surface rounded-2xl p-5 gap-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Ionicons name="diamond-outline" size={20} color={colors.brandText} />
          <Text className="text-content font-bold text-lg">
            ConnectAI Premium
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
          Teste grátis até {formatDateBR(subscription.trialEndsAt)}.
        </Text>
      )}

      {subscription.cancelAtPeriodEnd ? (
        <Text className="text-warning text-sm">
          Cancelamento agendado: o acesso premium termina em{' '}
          {formatDateBR(subscription.currentPeriodEnd)}.
        </Text>
      ) : (
        <Text className="text-content-muted text-sm">
          {isTrial ? 'Primeira cobrança' : 'Próxima renovação'} em{' '}
          {formatDateBR(subscription.currentPeriodEnd)}.
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

import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { Subscription, SubscriptionStatus } from '../types'
import { formatDateBR } from '../utils/formatDateBR'

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
    <View className="bg-zinc-900 rounded-2xl p-5 gap-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Ionicons name="diamond-outline" size={20} color="#a78bfa" />
          <Text className="text-white font-bold text-lg">
            ConnectAI Premium
          </Text>
        </View>
        <View
          className={`px-2.5 py-1 rounded-full ${isPastDue ? 'bg-red-600/20' : 'bg-violet-600/20'}`}
        >
          <Text
            className={`text-xs font-semibold ${isPastDue ? 'text-red-400' : 'text-violet-300'}`}
          >
            {STATUS_LABEL[subscription.status]}
          </Text>
        </View>
      </View>

      {isTrial && subscription.trialEndsAt && (
        <Text className="text-zinc-300 text-sm">
          Teste grátis até {formatDateBR(subscription.trialEndsAt)}.
        </Text>
      )}

      {subscription.cancelAtPeriodEnd ? (
        <Text className="text-amber-400 text-sm">
          Cancelamento agendado: o acesso premium termina em{' '}
          {formatDateBR(subscription.currentPeriodEnd)}.
        </Text>
      ) : (
        <Text className="text-zinc-400 text-sm">
          {isTrial ? 'Primeira cobrança' : 'Próxima renovação'} em{' '}
          {formatDateBR(subscription.currentPeriodEnd)}.
        </Text>
      )}

      {isPastDue && (
        <Text className="text-red-400 text-sm">
          Não conseguimos cobrar seu cartão. Atualize o pagamento para manter o
          acesso.
        </Text>
      )}
    </View>
  )
}

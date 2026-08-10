import { View, Text } from 'react-native'
import {
  EyeIcon,
  ShareNetworkIcon,
  CheckCircleIcon,
} from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import { colors } from '@/shared/theme'
import type { EventAnalyticsTotals } from '../types'

type Card = {
  key: keyof EventAnalyticsTotals
  label: string
  icon: Icon
  color: string
}

// Cores casadas com as séries do gráfico pra leitura consistente entre card e
// linha.
const CARDS: Card[] = [
  {
    key: 'views',
    label: 'Visualizações',
    icon: EyeIcon,
    color: colors.brandText,
  },
  {
    key: 'shares',
    label: 'Compartilhamentos',
    icon: ShareNetworkIcon,
    color: colors.info,
  },
  {
    key: 'confirmations',
    label: 'Confirmações',
    icon: CheckCircleIcon,
    color: colors.successText,
  },
]

type Props = {
  totals: EventAnalyticsTotals
}

export function AnalyticsSummaryCards({ totals }: Props) {
  return (
    <View className="flex-row gap-3">
      {CARDS.map(card => (
        <View
          key={card.key}
          className="flex-1 bg-surface-sunken border border-line rounded-xl p-3"
        >
          <View className="w-9 h-9 rounded-full bg-surface-elevated items-center justify-center mb-2">
            <card.icon size={18} color={card.color} />
          </View>
          <Text className="text-content font-bold text-xl">
            {totals[card.key]}
          </Text>
          <Text className="text-content-muted text-xs mt-0.5">
            {card.label}
          </Text>
        </View>
      ))}
    </View>
  )
}

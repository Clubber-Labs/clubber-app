import { View, Text } from 'react-native'
import type { Plan } from '../types'
import { formatInterval, formatPrice } from '@/shared/utils/formatPrice'
import { useLocale } from '@/shared/hooks/useLocale'

type Props = {
  plan: Plan | undefined
  isLoading: boolean
}

/**
 * Bloco de preço da tela de upgrade. Progressivamente aprimorado: enquanto
 * carrega mostra um placeholder; se o preço não vier (endpoint indisponível)
 * não renderiza nada — a tela e o CTA seguem funcionando sem o número.
 */
export function PlanPriceCard({ plan, isLoading }: Props) {
  const locale = useLocale()
  if (isLoading) {
    return (
      <View className="bg-surface border border-line rounded-2xl p-5 items-center">
        <View className="h-9 w-32 rounded-lg bg-surface-elevated" />
        <View className="h-4 w-40 rounded bg-surface-elevated mt-3" />
      </View>
    )
  }

  if (!plan) return null

  const price = formatPrice(plan.amount, plan.currency, locale)
  const interval = formatInterval(plan.interval, locale)
  const hasTrial = plan.trialEligible && plan.trialDays > 0

  return (
    <View className="bg-surface border border-line rounded-2xl p-5 items-center">
      {hasTrial && (
        <View className="px-3 py-1 rounded-full bg-brand/20 border border-brand-emphasis/40 mb-3">
          <Text className="text-brand-text-strong text-xs font-bold tracking-wide">
            {plan.trialDays} DIAS GRÁTIS
          </Text>
        </View>
      )}

      <View className="flex-row items-baseline">
        <Text className="text-content font-bold text-4xl">{price}</Text>
        <Text className="text-content-muted text-base font-medium">
          /{interval}
        </Text>
      </View>

      <Text className="text-content-muted text-sm mt-2 text-center">
        {hasTrial
          ? `Teste grátis por ${plan.trialDays} dias. Depois ${price}/${interval}, cancele quando quiser.`
          : 'Assinatura mensal. Cancele quando quiser.'}
      </Text>
    </View>
  )
}

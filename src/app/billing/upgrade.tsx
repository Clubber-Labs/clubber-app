import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { ClockIcon, CrownIcon, XIcon } from 'phosphor-react-native'
import { useRouter } from 'expo-router'
import { useActivationFlow } from '@/features/billing/hooks/useActivationFlow'
import { usePlan } from '@/features/billing/hooks/usePlan'
import { PremiumBenefits } from '@/features/billing/components/PremiumBenefits'
import { PlanPriceCard } from '@/features/billing/components/PlanPriceCard'
import { Button } from '@/shared/components/Button'
import { getApiError } from '@/shared/lib/apiError'
import { colors } from '@/shared/theme'

export default function UpgradeScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { data: plan, isLoading: planLoading } = usePlan()
  const { phase, start, isStarting, error } = useActivationFlow()

  const ctaLabel =
    plan?.trialEligible && plan.trialDays > 0
      ? t('billing.upgrade.trialCta', { count: plan.trialDays })
      : t('billing.upgrade.cta')

  // Ativação demorou ou terminou em estado não-ativo: dá saída ao usuário.
  if (phase === 'stalled') {
    return (
      <View className="flex-1 bg-background items-center justify-center gap-5 px-8">
        <ClockIcon size={44} color={colors.brandText} />
        <Text className="text-content font-semibold text-lg text-center">
          {t('billing.upgrade.stalledTitle')}
        </Text>
        <Text className="text-content-muted text-sm text-center">
          {t('billing.upgrade.stalledBody')}
        </Text>
        <View className="w-full gap-3 mt-1">
          <Button
            label={t('billing.upgrade.seeSubscription')}
            onPress={() => router.replace('/billing/manage')}
          />
          <Pressable onPress={() => router.back()} hitSlop={8} className="py-2">
            <Text className="text-content-muted text-sm text-center">
              {t('common.back')}
            </Text>
          </Pressable>
        </View>
      </View>
    )
  }

  if (phase === 'activating') {
    return (
      <View className="flex-1 bg-background items-center justify-center gap-4 px-8">
        <ActivityIndicator size="large" color={colors.brand} />
        <Text className="text-content font-semibold text-lg">
          {t('billing.upgrade.activatingTitle')}
        </Text>
        <Text className="text-content-muted text-sm text-center">
          {t('billing.upgrade.activatingBody')}
        </Text>
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
    >
      <View className="flex-row items-center justify-between mb-6">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <XIcon size={26} color={colors.content} />
        </Pressable>
      </View>

      <View className="items-center mb-7">
        {/* Badge com camadas concêntricas pra dar profundidade/brilho ao
            ícone (NativeWind não tem gradiente nativo — halo via opacidades). */}
        <View className="w-28 h-28 rounded-full bg-brand/10 items-center justify-center mb-5">
          <View className="w-20 h-20 rounded-full bg-brand/20 items-center justify-center">
            <View className="w-14 h-14 rounded-2xl bg-brand items-center justify-center">
              <CrownIcon size={30} color={colors.content} weight="fill" />
            </View>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-content font-bold text-2xl">Clubber</Text>
          <View className="px-2 py-0.5 rounded-md bg-brand/20 border border-brand-emphasis/40">
            <Text className="text-brand-text-strong text-xs font-bold tracking-wide">
              {t('billing.premium')}
            </Text>
          </View>
        </View>
        <Text className="text-content-secondary text-base mt-3 text-center leading-6 px-2">
          {t('billing.upgrade.tagline')}
        </Text>
      </View>

      <PlanPriceCard plan={plan} isLoading={planLoading} />

      <View className="mt-8">
        <Text className="text-content-tertiary text-xs font-semibold uppercase tracking-wide mb-4">
          {t('billing.upgrade.benefitsTitle')}
        </Text>
        <PremiumBenefits />
      </View>

      <View className="mt-9 gap-3">
        <Button label={ctaLabel} onPress={start} loading={isStarting} />
        <Text className="text-content-subtle text-xs text-center leading-5">
          {t('billing.upgrade.disclaimer')}
        </Text>
        {error && (
          <Text className="text-danger text-sm text-center">
            {getApiError(error).message}
          </Text>
        )}
      </View>
    </ScrollView>
  )
}

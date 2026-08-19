import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ChartBarIcon } from 'phosphor-react-native'
import { useRouter } from 'expo-router'
import { Button } from '@/shared/components/Button'
import { colors } from '@/shared/theme'

// Bloqueio para autor sem premium: explica o recurso e leva ao upgrade.
export function PremiumAnalyticsGate() {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <View className="flex-1 items-center justify-center px-8 gap-5">
      <View className="w-20 h-20 rounded-full bg-brand/20 items-center justify-center">
        <ChartBarIcon size={34} color={colors.brandText} weight="fill" />
      </View>

      <View className="items-center gap-2">
        <View className="flex-row items-center gap-2">
          <Text className="text-content font-bold text-xl">
            {t('analytics.short')}
          </Text>
          <View className="px-2 py-0.5 rounded-md bg-brand/20 border border-brand-emphasis/40">
            <Text className="text-brand-text-strong text-xs font-bold tracking-wide">
              {t('billing.premium')}
            </Text>
          </View>
        </View>
        <Text className="text-content-muted text-sm text-center">
          {t('analytics.gateBody')}
        </Text>
      </View>

      <View className="w-full mt-2">
        <Button
          label={t('analytics.premiumCta')}
          onPress={() => router.push('/billing/upgrade')}
        />
      </View>
    </View>
  )
}

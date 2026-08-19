import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ClockIcon, SparkleIcon } from 'phosphor-react-native'
import { Button } from '@/shared/components/Button'
import { SpotSheetState } from './SpotSheetState'
import { colors } from '@/shared/theme'

type Props = {
  // Free zera em 5/dia, premium em 25/dia — muda o texto e some o upsell.
  isPremium: boolean
  onUpgrade: () => void
  onSeeMap: () => void
}

// Caminho infeliz: a quota diária de gerações acabou. Pro free, o limite vira
// oportunidade (upsell do Premium); pro premium, só informa que volta amanhã.
export function SpotQuotaExhausted({ isPremium, onUpgrade, onSeeMap }: Props) {
  const { t } = useTranslation()
  const limit = isPremium ? 25 : 5

  return (
    <SpotSheetState
      icon={ClockIcon}
      tone="warning"
      title={t('spots.quota.title', { count: limit })}
      description={
        isPremium
          ? t('spots.quota.premiumDescription')
          : t('spots.quota.freeDescription')
      }
    >
      {!isPremium && (
        <View className="w-full bg-brand-surface border border-brand-surface-strong rounded-2xl p-4 gap-2 mt-1">
          <View className="flex-row items-center gap-2">
            <SparkleIcon size={16} color={colors.brandText} />
            <Text className="text-brand-text-bright text-sm font-bold">
              {t('spots.premium.name')}
            </Text>
          </View>
          <Text className="text-content-tertiary text-xs">
            {t('spots.quota.premiumPerks')}
          </Text>
          <Button label={t('spots.premium.cta')} onPress={onUpgrade} />
        </View>
      )}

      <Pressable onPress={onSeeMap} className="py-2" accessibilityRole="button">
        <Text className="text-content-muted text-sm font-semibold">
          {t('spots.quota.seeMap')}
        </Text>
      </Pressable>
    </SpotSheetState>
  )
}

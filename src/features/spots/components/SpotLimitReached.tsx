import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { StackIcon, SparkleIcon } from 'phosphor-react-native'
import { Button } from '@/shared/components/Button'
import { colors } from '@/shared/theme'

type Props = {
  // Free trava em 5 ativos; premium tem teto maior → sem upsell, só "encerre um".
  isPremium: boolean
  onUpgrade: () => void
  onBack: () => void
}

// Estado dedicado do 409 ao publicar: já existe o máximo de rolês ativos ao
// mesmo tempo. Pro free, o limite vira oportunidade — Premium dá mais slots
// simultâneos; pro premium (teto maior já atingido), só orienta a encerrar um.
export function SpotLimitReached({ isPremium, onUpgrade, onBack }: Props) {
  const { t } = useTranslation()
  return (
    <View className="flex-1 items-center justify-center px-6 gap-3">
      <View className="w-16 h-16 rounded-2xl bg-warning/15 border border-warning/30 items-center justify-center">
        <StackIcon size={28} color={colors.warningText} />
      </View>

      <Text className="text-content text-lg font-bold text-center">
        {isPremium ? t('spots.limit.premiumTitle') : t('spots.limit.freeTitle')}
      </Text>
      <Text className="text-content-muted text-sm text-center">
        {isPremium
          ? t('spots.limit.premiumDescription')
          : t('spots.limit.freeDescription')}
      </Text>

      {!isPremium && (
        <View className="w-full bg-brand-surface border border-brand-surface-strong rounded-2xl p-4 gap-2 mt-1">
          <View className="flex-row items-center gap-2">
            <SparkleIcon size={16} color={colors.brandText} />
            <Text className="text-brand-text-bright text-sm font-bold">
              {t('spots.premium.name')}
            </Text>
          </View>
          <Text className="text-content-tertiary text-xs">
            {t('spots.limit.premiumPerks')}
          </Text>
          <Button label={t('spots.premium.cta')} onPress={onUpgrade} />
        </View>
      )}

      <Pressable onPress={onBack} className="py-2" accessibilityRole="button">
        <Text className="text-content-muted text-sm font-semibold">
          {t('common.back')}
        </Text>
      </Pressable>
    </View>
  )
}

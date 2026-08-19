import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ChartBarIcon, CaretRightIcon } from 'phosphor-react-native'
import { useRouter } from 'expo-router'
import { colors } from '@/shared/theme'

type Props = {
  eventId: string
  isPremium: boolean
}

// Entrada do dashboard no detalhe do evento. Renderizada só para o autor (a
// tela decide). Premium abre o dashboard; não-premium vai para o upgrade.
export function EventAnalyticsEntryCard({ eventId, isPremium }: Props) {
  const { t } = useTranslation()
  const router = useRouter()

  function handlePress() {
    router.push(isPremium ? `/events/${eventId}/analytics` : '/billing/upgrade')
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      className="flex-row items-center gap-3 bg-surface-sunken border border-line rounded-xl px-4 py-3 active:opacity-70"
    >
      <View className="w-10 h-10 rounded-full bg-brand/20 items-center justify-center">
        <ChartBarIcon size={20} color={colors.brandText} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-content font-semibold text-base">
            {t('analytics.short')}
          </Text>
          {!isPremium && (
            <View className="px-1.5 py-0.5 rounded-md bg-brand/20 border border-brand-emphasis/40">
              <Text className="text-brand-text-strong text-xs font-bold tracking-wide">
                PREMIUM
              </Text>
            </View>
          )}
        </View>
        <Text className="text-content-muted text-sm mt-0.5">
          {isPremium ? t('analytics.entryHint') : t('analytics.entryLocked')}
        </Text>
      </View>
      <CaretRightIcon size={18} color={colors.contentSubtle} />
    </Pressable>
  )
}

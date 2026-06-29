import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
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
  const limit = isPremium ? 25 : 5

  return (
    <SpotSheetState
      icon="time-outline"
      tone="warning"
      title={`Você usou suas ${limit} gerações de hoje`}
      description={
        isPremium
          ? 'Elas voltam amanhã.'
          : 'Elas voltam amanhã. Quer continuar descobrindo agora?'
      }
    >
      {!isPremium && (
        <View className="w-full bg-brand-surface border border-brand-surface-strong rounded-2xl p-4 gap-2 mt-1">
          <View className="flex-row items-center gap-2">
            <Ionicons name="sparkles" size={16} color={colors.brandText} />
            <Text className="text-brand-text-bright text-sm font-bold">
              Clubber Premium
            </Text>
          </View>
          <Text className="text-content-tertiary text-xs">
            25 gerações por dia, raio maior e mais spots ativos.
          </Text>
          <Button label="Conhecer o Premium" onPress={onUpgrade} />
        </View>
      )}

      <Pressable onPress={onSeeMap} className="py-2" accessibilityRole="button">
        <Text className="text-content-muted text-sm font-semibold">
          Ver rolês no mapa
        </Text>
      </Pressable>
    </SpotSheetState>
  )
}

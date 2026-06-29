import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
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
  return (
    <View className="flex-1 items-center justify-center px-6 gap-3">
      <View className="w-16 h-16 rounded-2xl bg-warning/15 border border-warning/30 items-center justify-center">
        <Ionicons name="albums-outline" size={28} color={colors.warningText} />
      </View>

      <Text className="text-content text-lg font-bold text-center">
        {isPremium
          ? 'Você atingiu o limite de rolês ativos'
          : 'Você já tem 5 rolês ativos'}
      </Text>
      <Text className="text-content-muted text-sm text-center">
        {isPremium
          ? 'Encerre ou deixe um expirar para publicar outro.'
          : 'Esse é o limite no plano free. Encerre um, deixe expirar — ou tenha mais rolês no ar ao mesmo tempo com o Premium.'}
      </Text>

      {!isPremium && (
        <View className="w-full bg-brand-surface border border-brand-surface-strong rounded-2xl p-4 gap-2 mt-1">
          <View className="flex-row items-center gap-2">
            <Ionicons name="sparkles" size={16} color={colors.brandText} />
            <Text className="text-brand-text-bright text-sm font-bold">
              Clubber Premium
            </Text>
          </View>
          <Text className="text-content-tertiary text-xs">
            Mais rolês ativos ao mesmo tempo, 25 gerações por dia e raio maior.
          </Text>
          <Button label="Conhecer o Premium" onPress={onUpgrade} />
        </View>
      )}

      <Pressable onPress={onBack} className="py-2" accessibilityRole="button">
        <Text className="text-content-muted text-sm font-semibold">Voltar</Text>
      </Pressable>
    </View>
  )
}

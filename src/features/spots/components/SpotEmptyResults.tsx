import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { SparkleIcon } from 'phosphor-react-native'
import { Button } from '@/shared/components/Button'
import { SpotSheetState } from './SpotSheetState'

type Props = {
  radiusKm: number
  maxRadiusKm: number
  // Regerar com um raio maior (override por param — o setState não chega a tempo).
  onIncreaseRadius: (km: number) => void
  // Voltar pros controles pra refinar a intenção/raio.
  onEditQuery: () => void
}

// Caminho infeliz: a geração voltou sem lugares. Estado dedicado com saídas —
// aumentar o raio (até o teto) e regerar, ou editar a descrição.
export function SpotEmptyResults({
  radiusKm,
  maxRadiusKm,
  onIncreaseRadius,
  onEditQuery,
}: Props) {
  const { t } = useTranslation()
  const nextRadius = radiusKm < 15 ? 15 : maxRadiusKm
  const canIncrease = radiusKm < maxRadiusKm

  return (
    <SpotSheetState
      icon={SparkleIcon}
      title={t('spots.empty.title')}
      description={t('spots.empty.description')}
    >
      <View className="w-full gap-2 mt-1">
        {canIncrease && (
          <Button
            label={t('spots.empty.increaseRadius', { km: nextRadius })}
            variant="neutral"
            onPress={() => onIncreaseRadius(nextRadius)}
          />
        )}
        <Pressable
          onPress={onEditQuery}
          className="items-center py-1"
          accessibilityRole="button"
        >
          <Text className="text-content-muted text-sm font-semibold">
            {t('spots.empty.editQuery')}
          </Text>
        </Pressable>
      </View>
    </SpotSheetState>
  )
}

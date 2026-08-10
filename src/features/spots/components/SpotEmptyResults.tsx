import { View, Text, Pressable } from 'react-native'
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
  const nextRadius = radiusKm < 15 ? 15 : maxRadiusKm
  const canIncrease = radiusKm < maxRadiusKm

  return (
    <SpotSheetState
      icon={SparkleIcon}
      title="Nada à altura por aqui"
      description="A IA não achou bons lugares nessa busca. Tente aumentar o raio ou descrever melhor o que você quer."
    >
      <View className="w-full gap-2 mt-1">
        {canIncrease && (
          <Button
            label={`Aumentar raio pra ${nextRadius} km`}
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
            Editar descrição
          </Text>
        </Pressable>
      </View>
    </SpotSheetState>
  )
}

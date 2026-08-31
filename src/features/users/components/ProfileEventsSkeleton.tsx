import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { PROFILE_TILE_ART_HEIGHT } from './ProfileEventTile'

// Arte + rodapé de uma linha de título: o fantasma ocupa o mesmo lugar que o
// tile vai ocupar, pra grade não saltar quando os dados chegam.
const GHOST_HEIGHT = PROFILE_TILE_ART_HEIGHT + 52
const ROWS = [0, 1]
const COLUMNS = [0, 1]

// Enquanto a 1ª página não chega. Sem isto a lista mostra o estado vazio ("nada
// por aqui") no lugar do carregamento — a leitura errada, e a que aparece antes.
export function ProfileEventsSkeleton() {
  const pulse = useSharedValue(0.4)

  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.85, { duration: 850 }), -1, true)
  }, [pulse])

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }))

  return (
    <View className="gap-2 px-4">
      {ROWS.map(row => (
        <View key={row} className="flex-row gap-2">
          {COLUMNS.map(column => (
            <Animated.View
              key={column}
              className="flex-1 rounded-xl border border-line bg-surface"
              style={[{ height: GHOST_HEIGHT }, pulseStyle]}
            />
          ))}
        </View>
      ))}
    </View>
  )
}

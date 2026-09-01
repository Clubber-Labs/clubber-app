import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import {
  MURAL_COLUMNS,
  MURAL_GAP,
  MURAL_SUMMARY_ROWS,
} from '../utils/profileStage'

const ROWS = Array.from({ length: MURAL_SUMMARY_ROWS }, (_, i) => i)
const COLUMNS = Array.from({ length: MURAL_COLUMNS }, (_, i) => i)

// Duas fileiras fantasmas com a geometria exata da grade — o mural não salta
// quando as fotos chegam.
export function ProfileMuralSkeleton({ tileSize }: { tileSize: number }) {
  const pulse = useSharedValue(0.4)

  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.85, { duration: 850 }), -1, true)
  }, [pulse])

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }))

  return (
    <View style={{ gap: MURAL_GAP }}>
      {ROWS.map(row => (
        <View key={row} className="flex-row" style={{ gap: MURAL_GAP }}>
          {COLUMNS.map(column => (
            <Animated.View
              key={column}
              className="bg-surface"
              style={[{ width: tileSize, height: tileSize }, pulseStyle]}
            />
          ))}
        </View>
      ))}
    </View>
  )
}

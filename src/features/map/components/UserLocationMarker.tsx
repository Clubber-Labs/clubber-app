import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { VIOLET_500 } from '../constants'

const SIZE = 46
const RING = 3
const FRAME = SIZE * 3

// Marcador da posição do usuário: avatar num anel violeta + pulse "sonar".
export function UserLocationMarker({
  name,
  avatarUrl,
}: {
  name: string
  avatarUrl?: string | null
}) {
  const pulse = useSharedValue(0)

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    )
  }, [pulse])

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 1.8 }],
    opacity: 0.45 * (1 - pulse.value),
  }))

  return (
    <View
      style={{
        width: FRAME,
        height: FRAME,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      pointerEvents="none"
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            backgroundColor: VIOLET_500,
          },
          pulseStyle,
        ]}
      />
      <View
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          borderWidth: RING,
          borderColor: VIOLET_500,
          backgroundColor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <UserAvatar name={name} avatarUrl={avatarUrl} size={SIZE - RING * 2} />
      </View>
    </View>
  )
}

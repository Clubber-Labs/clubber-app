import { useEffect } from 'react'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { EventCardSkeleton } from '@/features/events/components/EventCardSkeleton'
import { SpotFeedCardSkeleton } from '@/features/spots/components/SpotFeedCardSkeleton'
import type { FeedKind } from '../types'

type Props = {
  kind: FeedKind
}

// Enquanto a 1ª página da aba não chega. O fantasma antecipa a anatomia da
// lista que vem: Eventos = pôsteres, Rolês = mapas, Tudo = a mescla dos dois.
export function FeedSkeleton({ kind }: Props) {
  // Um pulso só na raiz: animar osso a osso multiplicaria trabalho da UI
  // thread justamente no frame em que a troca de aba já está cara.
  const pulse = useSharedValue(0.4)

  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.85, { duration: 850 }), -1, true)
  }, [pulse])

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }))

  return (
    <Animated.View style={pulseStyle}>
      {kind === 'SPOTS' ? (
        <>
          <SpotFeedCardSkeleton />
          <SpotFeedCardSkeleton />
          <SpotFeedCardSkeleton />
        </>
      ) : kind === 'EVENTS' ? (
        <>
          <EventCardSkeleton />
          <EventCardSkeleton />
        </>
      ) : (
        <>
          <EventCardSkeleton />
          <SpotFeedCardSkeleton />
        </>
      )}
    </Animated.View>
  )
}

import type { ReactNode } from 'react'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated'

type Props = {
  index: number
  width: number
  scrollX: SharedValue<number>
  children: ReactNode
}

// Crossfade do pager no thread de UI: a cena inteira esmaece ao sair e acende
// ao entrar. Em worklet de propósito — a versão JS-driven (Animated do RN)
// derrubava frames com as cenas de mapa/SVG durante o arrasto.
export function SlideFrame({ index, width, scrollX, children }: Props) {
  const style = useAnimatedStyle(() => ({
    flex: 1,
    opacity: interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [0.25, 1, 0.25],
      Extrapolation.CLAMP,
    ),
  }))
  return <Animated.View style={style}>{children}</Animated.View>
}

import { useEffect, type ReactElement } from 'react'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

type EnterVariant = 'drop' | 'rise' | 'pop'

type Props = {
  active: boolean
  variant: EnterVariant
  delay?: number
  children: ReactElement
}

// Entrada animada dos elementos de arte quando o slide vira o ativo — apenas
// transform/opacity, terminando no layout original (posição/tamanho/fonte
// intactos). Zera ao sair do slide pra replay a cada visita.
//
// Curvas desacopladas de propósito: a mola subamortecida rebate abaixo de 1
// depois do overshoot — no scale é o quique desejado, mas na opacidade fazia
// o elemento (visível no wordmark) escurecer de leve antes de assentar. A
// opacidade sobe monotônica via timing; o quique fica só nos transforms.
export function Enter({ active, variant, delay = 0, children }: Props) {
  const progress = useSharedValue(0)
  const fade = useSharedValue(0)

  useEffect(() => {
    progress.value = 0
    fade.value = 0
    if (active) {
      progress.value = withDelay(
        delay,
        withSpring(1, { damping: 14, stiffness: 170 }),
      )
      fade.value = withDelay(delay, withTiming(1, { duration: 200 }))
    }
  }, [active, delay, progress, fade])

  const style = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform:
      variant === 'pop'
        ? [{ scale: 0.6 + 0.4 * progress.value }]
        : [
            {
              translateY:
                (variant === 'drop' ? -28 : 18) * (1 - progress.value),
            },
          ],
  }))

  // Base inline com opacity 0: o worklet só aplica o estilo depois do
  // primeiro frame — sem a base, o elemento pisca no estado final antes da
  // entrada começar (mesma classe do bug do CTA fantasma no rodapé).
  return (
    <Animated.View style={[{ opacity: 0 }, style]}>{children}</Animated.View>
  )
}

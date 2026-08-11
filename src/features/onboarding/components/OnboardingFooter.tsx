import { useState } from 'react'
import { View } from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated'
import { Button } from '@/shared/components/Button'

type Props = {
  scrollX: SharedValue<number>
  width: number
  lastIdx: number
  // Página corrente (discreta): dot ativo + quem recebe toque.
  page: number
  onNext: () => void
  onRegister: () => void
  onLogin: () => void
}

// Rodapé do pager (dots + CTAs) com a troca Continuar → Criar conta/Já tenho
// conta acompanhando o arrasto do penúltimo pro último slide. SEM animação de
// layout: o container mantém a altura do botão único e a pilha vaza pra cima
// em absoluto, enquanto os dots sobem por translateY na mesma medida —
// transform/opacity puros (animar minHeight rodava layout do Yoga por frame e
// era o lag desta transição). Alturas medidas em runtime (onLayout).
export function OnboardingFooter({
  scrollX,
  width,
  lastIdx,
  page,
  onNext,
  onRegister,
  onLogin,
}: Props) {
  const last = page === lastIdx
  const [singleH, setSingleH] = useState(0)
  const [stackH, setStackH] = useState(0)

  const dotsStyle = useAnimatedStyle(() => {
    const p = interpolate(
      scrollX.value,
      [(lastIdx - 1) * width, lastIdx * width],
      [0, 1],
      Extrapolation.CLAMP,
    )
    const lift = singleH > 0 && stackH > 0 ? stackH - singleH : 0
    return { transform: [{ translateY: -lift * p }] }
  })

  const singleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollX.value,
      [(lastIdx - 1) * width, lastIdx * width],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }))

  const stackStyle = useAnimatedStyle(() => {
    const p = interpolate(
      scrollX.value,
      [(lastIdx - 1) * width, lastIdx * width],
      [0, 1],
      Extrapolation.CLAMP,
    )
    return { opacity: p, transform: [{ translateY: 16 * (1 - p) }] }
  })

  return (
    <View className="gap-6">
      <Animated.View
        className="flex-row justify-center gap-2"
        style={dotsStyle}
      >
        {Array.from({ length: lastIdx + 1 }, (_, i) => (
          <View
            key={i}
            className={`h-1.5 rounded-full ${i === page ? 'w-6 bg-content' : 'w-1.5 bg-surface-high'}`}
          />
        ))}
      </Animated.View>
      <View>
        <Animated.View
          pointerEvents={last ? 'none' : 'auto'}
          onLayout={e => setSingleH(e.nativeEvent.layout.height)}
          style={singleStyle}
        >
          <Button label="Continuar" size="lg" onPress={onNext} />
        </Animated.View>
        <Animated.View
          pointerEvents={last ? 'auto' : 'none'}
          onLayout={e => setStackH(e.nativeEvent.layout.height)}
          // Base inline com opacity 0: o worklet só aplica o estilo DEPOIS do
          // primeiro frame (e reaplica quando as medidas chegam) — sem a base,
          // a pilha piscava visível sobre o Continuar no slide 1 (o "Já tenho
          // conta" escuro lia como faixa preta subindo do rodapé).
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0,
              transform: [{ translateY: 16 }],
            },
            stackStyle,
          ]}
        >
          <View className="gap-3">
            <Button label="Criar conta" size="lg" onPress={onRegister} />
            <Button
              label="Já tenho conta"
              variant="neutral"
              size="lg"
              onPress={onLogin}
            />
          </View>
        </Animated.View>
      </View>
    </View>
  )
}

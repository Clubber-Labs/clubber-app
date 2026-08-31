import { useEffect, useRef, useState, type ReactNode } from 'react'
import { View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { runOnJS } from 'react-native-worklets'

type Props = {
  open: boolean
  children: ReactNode
}

const TIMING = { duration: 200 }
const CLOSED = { height: 0 }

/**
 * Abre e fecha colapsando a altura — fechado não deixa buraco no fluxo. O filho
 * continua montado (o clipe é do container), então reabrir não remonta nada nem
 * perde o estado de quem está dentro.
 *
 * ABERTO E PARADO NÃO TEM ALTURA FIXA: quem manda é o conteúdo, e a medida serve
 * só de alvo pra animação. Prender o container na última medida fazia o conteúdo
 * aparecer cortado — ou sumir — sempre que ela ficasse velha ou fosse tirada num
 * layout transitório (a lista remonta o header ao alternar entre itens e vazio),
 * e nada mais corrigia: o filho não muda de tamanho, então outro onLayout nunca
 * vinha.
 *
 * GOTCHA: quem tem flexShrink (a ScrollView do RN traz 1 de fábrica) precisa
 * zerar isso, senão encolhe junto com o container durante a animação e mede
 * zero — ver EventStatusFilter.
 */
export function Collapsible({ open, children }: Props) {
  const [animating, setAnimating] = useState(false)
  // Ref, não estado: a medida não entra em render nenhum, só alimenta o alvo da
  // próxima animação.
  const contentHeight = useRef(0)
  const height = useSharedValue(0)
  const mounted = useRef(false)

  useEffect(() => {
    // Monta direto no estado final: abrir a tela não deve parecer que algo
    // acabou de abrir sozinho.
    if (!mounted.current) {
      mounted.current = true
      return
    }
    if (!contentHeight.current) return
    setAnimating(true)
    height.value = open ? 0 : contentHeight.current
    height.value = withTiming(
      open ? contentHeight.current : 0,
      TIMING,
      finished => {
        if (finished) runOnJS(setAnimating)(false)
      },
    )
  }, [open, height])

  const animatedStyle = useAnimatedStyle(() => ({ height: height.value }))

  return (
    <Animated.View
      className="overflow-hidden"
      style={animating ? animatedStyle : open ? undefined : CLOSED}
      pointerEvents={open ? 'auto' : 'none'}
      aria-hidden={!open}
    >
      <View
        onLayout={e => {
          const measured = e.nativeEvent.layout.height
          // Só vale a medida com o container solto: animando ou fechado, o que
          // se vê é a altura dele, não a do conteúdo.
          if (open && !animating && measured > 0) {
            contentHeight.current = measured
          }
        }}
      >
        {children}
      </View>
    </Animated.View>
  )
}

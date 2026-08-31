import { useEffect, useRef, useState, type ReactNode } from 'react'
import { View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

type Props = {
  open: boolean
  children: ReactNode
}

const TIMING = { duration: 200 }

// Abre e fecha pela altura medida do conteúdo — fechado não deixa buraco no
// fluxo. O filho continua montado (o clipe é do container), então reabrir não
// remonta nada nem perde o estado de quem está dentro.
//
// GOTCHA: o filho não pode encolher junto com o container, ou a medida vira 0 e
// nunca mais abre. Quem tem flexShrink (ScrollView do RN traz 1 de fábrica)
// precisa zerar isso — ver EventStatusFilter.
export function Collapsible({ open, children }: Props) {
  const [contentHeight, setContentHeight] = useState(0)
  const height = useSharedValue(0)
  const settled = useRef(false)

  useEffect(() => {
    if (!contentHeight) return
    const target = open ? contentHeight : 0
    // 1ª medição assume a altura sem animar: montar já aberto não deve parecer
    // que algo acabou de abrir.
    if (settled.current) {
      height.value = withTiming(target, TIMING)
    } else {
      height.value = target
      settled.current = true
    }
  }, [open, contentHeight, height])

  const animatedStyle = useAnimatedStyle(() => ({ height: height.value }))

  return (
    <Animated.View
      className="overflow-hidden"
      // Antes da 1ª medida a altura fica automática: assumir 0 esconderia o
      // conteúdo por um frame mesmo montando aberto.
      style={contentHeight ? animatedStyle : { opacity: open ? 1 : 0 }}
      pointerEvents={open ? 'auto' : 'none'}
      aria-hidden={!open}
    >
      <View
        onLayout={e => {
          const measured = e.nativeEvent.layout.height
          // Só mede aberto: fechado (e nos frames intermediários da animação) a
          // altura vista é a do container, não a do conteúdo.
          if (open && measured > 0) setContentHeight(measured)
        }}
      >
        {children}
      </View>
    </Animated.View>
  )
}

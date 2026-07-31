import { memo, useEffect, useRef, useState } from 'react'
import {
  Animated,
  Easing,
  Text,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native'
// ScrollView do gesture-handler: rola dentro de bottom sheets (SheetModal usa
// gestos do RNGH); o ScrollView nativo do RN é interceptado e não rola lá.
import { ScrollView } from 'react-native-gesture-handler'

export const WHEEL_ITEM_HEIGHT = 44
export const WHEEL_VISIBLE_ITEMS = 5
const WHEEL_HEIGHT = WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ITEMS
const PADDING = (WHEEL_HEIGHT - WHEEL_ITEM_HEIGHT) / 2

export type WheelItem = { label: string; value: number }

type Props = {
  items: WheelItem[]
  selectedValue: number
  onSelect: (value: number) => void
  flex?: number
}

// Coluna de roda (estilo iOS/Tinder): rola, encaixa item a item (snap) e o item
// central cresce/ilumina enquanto os vizinhos encolhem/desbotam. O nível de cada
// item (distância ao centro) vem do índice central rastreado no onScroll; a
// transição entre níveis é animada por célula (escala + opacidade, driver
// nativo) — sem Animated.event, que é frágil na nova arquitetura.
export function WheelColumn({
  items,
  selectedValue,
  onSelect,
  flex = 1,
}: Props) {
  const ref = useRef<ScrollView>(null)
  const lastReported = useRef(selectedValue)
  const scrollIdleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialIndex = Math.max(
    0,
    items.findIndex(i => i.value === selectedValue),
  )
  const [centerIndex, setCenterIndex] = useState(initialIndex)

  // Centra o item selecionado na montagem (sem animar).
  useEffect(() => {
    const id = requestAnimationFrame(() =>
      ref.current?.scrollTo({
        y: initialIndex * WHEEL_ITEM_HEIGHT,
        animated: false,
      }),
    )
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Limpa o debounce de scroll-parado ao desmontar.
  useEffect(
    () => () => {
      if (scrollIdleTimer.current) clearTimeout(scrollIdleTimer.current)
    },
    [],
  )

  // Sincroniza quando o valor muda de fora (ex.: dia clampado ao trocar de mês).
  useEffect(() => {
    if (selectedValue === lastReported.current) return
    const idx = items.findIndex(i => i.value === selectedValue)
    if (idx >= 0) {
      setCenterIndex(idx)
      ref.current?.scrollTo({ y: idx * WHEEL_ITEM_HEIGHT, animated: true })
    }
    lastReported.current = selectedValue
  }, [selectedValue, items])

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const y = e.nativeEvent.contentOffset.y
    const index = Math.round(y / WHEEL_ITEM_HEIGHT)
    const clamped = Math.max(0, Math.min(items.length - 1, index))
    setCenterIndex(prev => (prev === clamped ? prev : clamped))
    // Rodinha do mouse / trackpad rolam sem gerar drag-end nem momentum-end, então
    // a seleção nunca comitava (ficava no valor inicial). Debounce: quando o scroll
    // para, encaixa no item central e comita. Drag/flick comitam pelos handlers
    // próprios (que cancelam este timer).
    if (scrollIdleTimer.current) clearTimeout(scrollIdleTimer.current)
    scrollIdleTimer.current = setTimeout(() => settleTo(y), 140)
  }

  function settleTo(offsetY: number) {
    if (scrollIdleTimer.current) {
      clearTimeout(scrollIdleTimer.current)
      scrollIdleTimer.current = null
    }
    const index = Math.max(
      0,
      Math.min(items.length - 1, Math.round(offsetY / WHEEL_ITEM_HEIGHT)),
    )
    const value = items[index].value
    lastReported.current = value
    if (value !== selectedValue) onSelect(value)
  }

  // Drag lento solto sem flick (velocidade ~0) pode não gerar onMomentumScrollEnd
  // no iOS — o snap acontece visualmente mas a seleção não comitava. Comita aqui
  // sobre o offset (round = alvo do snap). Com velocidade, deixa o momentum
  // comitar o destino final.
  function handleScrollEndDrag(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const velocityY = e.nativeEvent.velocity?.y ?? 0
    if (Math.abs(velocityY) < 0.1) settleTo(e.nativeEvent.contentOffset.y)
  }

  return (
    <ScrollView
      ref={ref}
      style={{ flex, height: WHEEL_HEIGHT }}
      showsVerticalScrollIndicator={false}
      snapToInterval={WHEEL_ITEM_HEIGHT}
      decelerationRate="fast"
      scrollEventThrottle={16}
      nestedScrollEnabled
      onScroll={handleScroll}
      onScrollEndDrag={handleScrollEndDrag}
      onMomentumScrollEnd={e => settleTo(e.nativeEvent.contentOffset.y)}
      contentContainerStyle={{ paddingVertical: PADDING }}
    >
      {items.map((item, index) => (
        <WheelCell
          key={item.value}
          label={item.label}
          level={Math.min(2, Math.abs(index - centerIndex))}
        />
      ))}
    </ScrollView>
  )
}

const WheelCell = memo(function WheelCell({
  label,
  level,
}: {
  label: string
  level: number
}) {
  // `anim` segue o nível (0 = centro). Ao mudar, transiciona com easing — é o
  // que dá o crescer/iluminar elegante quando o item passa pelo centro.
  const anim = useRef(new Animated.Value(level)).current
  useEffect(() => {
    Animated.timing(anim, {
      toValue: level,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }, [level, anim])

  const opacity = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1, 0.45, 0.18],
  })
  const scale = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1, 0.84, 0.72],
  })

  return (
    <Animated.View
      style={{
        height: WHEEL_ITEM_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        transform: [{ scale }],
      }}
    >
      <Text
        numberOfLines={1}
        className={`text-content text-[20px] ${
          level === 0 ? 'font-bold' : 'font-semibold'
        }`}
      >
        {label}
      </Text>
    </Animated.View>
  )
})

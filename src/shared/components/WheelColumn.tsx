import { memo, useCallback, useEffect, useRef, useState } from 'react'
import {
  Text,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native'
// FlatList do gesture-handler: rola dentro de bottom sheets (SheetModal usa
// gestos do RNGH); o scroll nativo do RN é interceptado e não rola lá.
import { FlatList } from 'react-native-gesture-handler'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated'

export const WHEEL_ITEM_HEIGHT = 44
export const WHEEL_VISIBLE_ITEMS = 5
const WHEEL_HEIGHT = WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ITEMS
const PADDING = (WHEEL_HEIGHT - WHEEL_ITEM_HEIGHT) / 2

export type WheelItem = { label: string; value: number }

type Props = {
  items: WheelItem[]
  // Posiciona só na montagem, como um defaultValue: depois disso a posição é do
  // scroll e o pai só reage ao onSelect. Sem os dois lados mandando na posição
  // não há eco entre eles — a roda nunca é puxada de volta durante o gesto.
  initialValue: number
  onSelect: (value: number) => void
  flex?: number
}

// Item mais próximo por valor: usado quando `items` muda e o valor atual sai da
// lista (dia 31 num mês de 30, mês fora do range do ano escolhido).
function nearestIndex(items: WheelItem[], value: number): number {
  let best = 0
  let bestDistance = Infinity
  for (let i = 0; i < items.length; i++) {
    const distance = Math.abs(items[i].value - value)
    if (distance < bestDistance) {
      bestDistance = distance
      best = i
    }
  }
  return best
}

const keyExtractor = (item: WheelItem) => String(item.value)

// Altura fixa: dispensa medição e deixa o initialScrollIndex ser exato.
const getItemLayout = (
  _: ArrayLike<WheelItem> | null | undefined,
  i: number,
) => ({
  length: WHEEL_ITEM_HEIGHT,
  offset: WHEEL_ITEM_HEIGHT * i,
  index: i,
})

// Coluna de roda (estilo iOS/Tinder): rola, encaixa item a item (snap) e o item
// central cresce/ilumina enquanto os vizinhos encolhem/desbotam. O realce é
// função contínua do offset e é calculado na UI thread — o onScroll só escreve o
// offset num shared value, sem re-render por frame. Lista virtualizada de
// propósito: o estilo animado é por célula, então montar as ~107 de uma coluna de
// anos custaria uma atualização de view por célula por frame.
export function WheelColumn({
  items,
  initialValue,
  onSelect,
  flex = 1,
}: Props) {
  const ref = useRef<FlatList<WheelItem>>(null)
  const selected = useRef(initialValue)
  const [centerIndex, setCenterIndex] = useState(() =>
    nearestIndex(items, initialValue),
  )
  const offset = useSharedValue(centerIndex * WHEEL_ITEM_HEIGHT)

  const latest = useRef({ items, onSelect })
  useEffect(() => {
    latest.current = { items, onSelect }
  })

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    offset.value = e.nativeEvent.contentOffset.y
  }

  // `settle` arredonda pro alvo do snap e ignora repetição. Os dois caminhos
  // existem porque nem toda solta gera momentum (drag lento sem flick) e nem todo
  // momentum vem de um fim de drag útil; comitar duas vezes no mesmo gesto é
  // inofensivo — o que não pode é reagir a isso movendo a roda.
  const settle = useCallback((contentOffsetY: number) => {
    const list = latest.current.items
    if (list.length === 0) return
    const index = Math.max(
      0,
      Math.min(list.length - 1, Math.round(contentOffsetY / WHEEL_ITEM_HEIGHT)),
    )
    setCenterIndex(index)
    const value = list[index].value
    if (value === selected.current) return
    selected.current = value
    latest.current.onSelect(value)
  }, [])

  // Reencaixa quando a lista muda e o valor atual sai dela, ou quando os índices
  // andam. Sai cedo se a coluna já está no destino — reposicionar à toa faz o
  // realce piscar. Nunca animado: animação programática disputa com o
  // snapToInterval nativo e no Android as duas se atropelam até a coluna travar.
  useEffect(() => {
    if (items.length === 0) return
    const found = items.findIndex(i => i.value === selected.current)
    const index = found >= 0 ? found : nearestIndex(items, selected.current)
    if (found < 0) {
      selected.current = items[index].value
      latest.current.onSelect(items[index].value)
    }
    if (Math.round(offset.value / WHEEL_ITEM_HEIGHT) === index) return
    setCenterIndex(index)
    offset.value = index * WHEEL_ITEM_HEIGHT
    ref.current?.scrollToOffset({
      offset: index * WHEEL_ITEM_HEIGHT,
      animated: false,
    })
  }, [items, offset])

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<WheelItem>) => (
      <WheelCell
        label={item.label}
        index={index}
        offset={offset}
        centered={index === centerIndex}
      />
    ),
    [offset, centerIndex],
  )

  return (
    <FlatList
      ref={ref}
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      initialScrollIndex={centerIndex}
      extraData={centerIndex}
      style={{ flex, height: WHEEL_HEIGHT }}
      showsVerticalScrollIndicator={false}
      snapToInterval={WHEEL_ITEM_HEIGHT}
      decelerationRate="fast"
      scrollEventThrottle={16}
      nestedScrollEnabled
      onScroll={handleScroll}
      onScrollEndDrag={e => settle(e.nativeEvent.contentOffset.y)}
      onMomentumScrollEnd={e => settle(e.nativeEvent.contentOffset.y)}
      contentContainerStyle={{ paddingVertical: PADDING }}
    />
  )
}

type CellProps = {
  label: string
  index: number
  offset: SharedValue<number>
  centered: boolean
}

const WheelCell = memo(function WheelCell({
  label,
  index,
  offset,
  centered,
}: CellProps) {
  const style = useAnimatedStyle(() => {
    const distance = Math.abs(offset.value / WHEEL_ITEM_HEIGHT - index)
    return {
      opacity: interpolate(
        distance,
        [0, 1, 2],
        [1, 0.45, 0.18],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          scale: interpolate(
            distance,
            [0, 1, 2],
            [1, 0.84, 0.72],
            Extrapolation.CLAMP,
          ),
        },
      ],
    }
  })

  return (
    <Animated.View
      style={[
        {
          height: WHEEL_ITEM_HEIGHT,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text
        numberOfLines={1}
        className={`text-content text-[20px] ${
          centered ? 'font-bold' : 'font-semibold'
        }`}
      >
        {label}
      </Text>
    </Animated.View>
  )
})

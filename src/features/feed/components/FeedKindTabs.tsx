import { useEffect, useRef, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import type { FeedCounts, FeedKind } from '../types'

type Option = {
  value: FeedKind
  // Chave do dicionário: frase pronta na constante congelaria o idioma no boot.
  labelKey: `feed.kindFilter.${'all' | 'events' | 'spots'}`
  // "Tudo" fica sem número: ali ele seria a soma dos outros dois, e repetir a
  // conta não diz nada que as outras abas já não digam.
  countKey?: keyof FeedCounts
}

const OPTIONS: Option[] = [
  { value: 'ALL', labelKey: 'feed.kindFilter.all' },
  { value: 'EVENTS', labelKey: 'feed.kindFilter.events', countKey: 'events' },
  { value: 'SPOTS', labelKey: 'feed.kindFilter.spots', countKey: 'spots' },
]

const TIMING = { duration: 200 }

type Layout = { x: number; width: number }

type Props = {
  value: FeedKind
  onChange: (next: FeedKind) => void
  // Ausente antes da 1ª resposta (e enquanto o backend não mandar `counts`):
  // a aba desenha só o rótulo, sem reservar espaço vazio.
  counts?: FeedCounts
}

// O que entra no feed. Escolha ÚNICA (ao contrário dos chips de status, que
// somam): as três abas já cobrem o conjunto inteiro, e "nenhum" não é um
// estado que faça sentido pedir ao backend.
export function FeedKindTabs({ value, onChange, counts }: Props) {
  const { t } = useTranslation()
  // A aba não tem padding próprio — sua largura É a do rótulo, então a medida
  // do Pressable serve direto de geometria pro indicador.
  const [layouts, setLayouts] = useState<Partial<Record<FeedKind, Layout>>>({})
  const active = layouts[value]

  const x = useSharedValue(0)
  const width = useSharedValue(0)
  const positioned = useRef(false)

  useEffect(() => {
    if (!active) return
    // No 1º layout o indicador nasce no lugar: animar dali daria a impressão
    // de que a aba mudou sozinha ao abrir a tela.
    if (positioned.current) {
      x.value = withTiming(active.x, TIMING)
      width.value = withTiming(active.width, TIMING)
    } else {
      x.value = active.x
      width.value = active.width
      positioned.current = true
    }
  }, [active, x, width])

  const indicatorStyle = useAnimatedStyle(() => ({
    width: width.value,
    transform: [{ translateX: x.value }],
  }))

  return (
    <View className="h-11 border-b border-line">
      <View className="flex-row h-full px-4 gap-[22px]">
        {OPTIONS.map(option => {
          const isActive = option.value === value
          const count = option.countKey ? counts?.[option.countKey] : undefined
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              className="justify-center active:opacity-70"
              onLayout={e => {
                const { x: nextX, width: nextWidth } = e.nativeEvent.layout
                setLayouts(prev => {
                  const known = prev[option.value]
                  if (known?.x === nextX && known.width === nextWidth) {
                    return prev
                  }
                  return {
                    ...prev,
                    [option.value]: { x: nextX, width: nextWidth },
                  }
                })
              }}
            >
              {/* Peso igual nos dois estados: trocar de aba mudaria a largura
                  do rótulo e o indicador perseguiria um alvo em movimento. */}
              <Text
                className={`text-[15px] font-extrabold ${
                  isActive ? 'text-content' : 'text-content-subtle'
                }`}
              >
                {t(option.labelKey)}
                {count !== undefined && (
                  <Text className="text-[11px] text-content-subtle">
                    {' '}
                    {count}
                  </Text>
                )}
              </Text>
            </Pressable>
          )
        })}
      </View>
      {/* Fora da linha com padding: o x medido do Pressable já embute os 16px,
          e aqui o left:0 é a borda do container — as duas origens batem.
          bottom:-1 assenta a barra em cima da hairline, não acima dela. */}
      <Animated.View
        pointerEvents="none"
        className="absolute left-0 h-0.5 rounded-full bg-content"
        style={[{ bottom: -1 }, indicatorStyle]}
      />
    </View>
  )
}

import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import type { LayoutChangeEvent } from 'react-native'
import Svg, { Line, Polyline, Circle } from 'react-native-svg'
import { formatDayMonthYear } from '@/shared/utils/dateFormat'
import { useLocale } from '@/shared/hooks/useLocale'
import { colors } from '@/shared/theme'
import type { EventAnalyticsTimelinePoint } from '../types'

type MetricKey = 'views' | 'shares' | 'confirmations'

type Series = {
  key: MetricKey
  label: string
  color: string
}

const SERIES: Series[] = [
  { key: 'views', label: 'Visualizações', color: colors.brandText },
  { key: 'shares', label: 'Compartilhamentos', color: colors.info },
  { key: 'confirmations', label: 'Confirmações', color: colors.successText },
]

const CHART_HEIGHT = 160
const PADDING_X = 6
// Folga no topo pra o ponto de maior valor não encostar na borda do gráfico.
const TOP_GUTTER = 12

type Props = {
  timeline: EventAnalyticsTimelinePoint[]
}

// Gráfico interativo: toque numa faixa do dia pra ver os valores e toque na
// legenda pra ligar/desligar cada série.
export function AnalyticsLineChart({ timeline }: Props) {
  const locale = useLocale()
  const [width, setWidth] = useState(0)
  const [hidden, setHidden] = useState<Record<MetricKey, boolean>>({
    views: false,
    shares: false,
    confirmations: false,
  })
  const [selected, setSelected] = useState<number | null>(null)

  if (timeline.length === 0) {
    return (
      <View className="bg-surface-sunken border border-line rounded-xl p-6 items-center">
        <Text className="text-content-muted text-sm text-center">
          Ainda não há dados para exibir.
        </Text>
        <Text className="text-content-subtle text-xs text-center mt-1">
          Os números aparecem conforme as pessoas interagem com o evento.
        </Text>
      </View>
    )
  }

  function onLayout(e: LayoutChangeEvent) {
    setWidth(e.nativeEvent.layout.width)
  }

  function toggle(key: MetricKey) {
    setHidden(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const visibleSeries = SERIES.filter(s => !hidden[s.key])

  const maxValue = Math.max(
    1,
    ...timeline.flatMap(point => visibleSeries.map(s => point[s.key])),
  )

  const innerW = Math.max(0, width - PADDING_X * 2)
  const band = innerW / timeline.length
  const xAt = (i: number) => PADDING_X + band * i + band / 2
  const yAt = (value: number) =>
    CHART_HEIGHT - (value / maxValue) * (CHART_HEIGHT - TOP_GUTTER)

  // Após um refresh a timeline pode encolher; ignora seleção fora do range pra
  // não desenhar guia/realce órfãos.
  const selectedIndex =
    selected !== null && selected >= 0 && selected < timeline.length
      ? selected
      : null
  const selectedPoint = selectedIndex !== null ? timeline[selectedIndex] : null

  return (
    <View className="bg-surface-sunken border border-line rounded-xl p-4">
      {/* Legenda interativa — toque pra ligar/desligar a série. */}
      <View className="flex-row flex-wrap gap-x-4 gap-y-2 mb-3">
        {SERIES.map(s => (
          <Pressable
            key={s.key}
            onPress={() => toggle(s.key)}
            hitSlop={6}
            className={`flex-row items-center gap-1.5 ${hidden[s.key] ? 'opacity-40' : ''}`}
          >
            <View
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <Text className="text-content-tertiary text-xs">{s.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Detalhe do dia selecionado (ou dica de interação). */}
      {selectedPoint ? (
        <View className="mb-2">
          <Text className="text-content-secondary text-xs font-semibold">
            {formatDayMonthYear(selectedPoint.date, locale)}
          </Text>
          <View className="flex-row gap-4 mt-1">
            {SERIES.map(s => (
              <View key={s.key} className="flex-row items-center gap-1">
                <View
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <Text className="text-content-secondary text-xs">
                  {selectedPoint[s.key]}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <Text className="text-content-subtle text-xs mb-2">
          Toque no gráfico para ver os números de um dia.
        </Text>
      )}

      {/* Área do gráfico. As faixas tocáveis ficam sobrepostas em valor real. */}
      <View
        onLayout={onLayout}
        style={{ height: CHART_HEIGHT }}
        className="relative"
      >
        {width > 0 && (
          <Svg width={width} height={CHART_HEIGHT}>
            {/* Linha de base e guia central. */}
            <Line
              x1={0}
              y1={CHART_HEIGHT - 0.5}
              x2={width}
              y2={CHART_HEIGHT - 0.5}
              stroke={colors.line}
              strokeWidth={1}
            />
            <Line
              x1={0}
              y1={yAt(maxValue / 2)}
              x2={width}
              y2={yAt(maxValue / 2)}
              stroke={colors.line}
              strokeWidth={1}
              strokeDasharray="3 4"
            />

            {/* Guia vertical do dia selecionado. */}
            {selectedIndex !== null && (
              <Line
                x1={xAt(selectedIndex)}
                y1={0}
                x2={xAt(selectedIndex)}
                y2={CHART_HEIGHT}
                stroke={colors.lineStrong}
                strokeWidth={1}
              />
            )}

            {/* Uma polilinha por série visível. */}
            {visibleSeries.map(s => (
              <Polyline
                key={s.key}
                points={timeline
                  .map((p, i) => `${xAt(i)},${yAt(p[s.key])}`)
                  .join(' ')}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}

            {/* Pontos (maiores no dia selecionado). */}
            {visibleSeries.map(s =>
              timeline.map((p, i) => (
                <Circle
                  key={`${s.key}-${i}`}
                  cx={xAt(i)}
                  cy={yAt(p[s.key])}
                  r={selectedIndex === i ? 4 : 2.5}
                  fill={s.color}
                />
              )),
            )}
          </Svg>
        )}

        {width > 0 && (
          <View className="absolute inset-0 flex-row">
            {timeline.map((p, i) => (
              <Pressable
                key={`${p.date}-${i}`}
                className="flex-1"
                onPress={() => setSelected(prev => (prev === i ? null : i))}
              />
            ))}
          </View>
        )}
      </View>

      {/* Extremos do período. */}
      {timeline.length > 1 && (
        <View className="flex-row justify-between mt-2">
          <Text className="text-content-subtle text-xs">
            {formatDayMonthYear(timeline[0].date, locale)}
          </Text>
          <Text className="text-content-subtle text-xs">
            {formatDayMonthYear(timeline[timeline.length - 1].date, locale)}
          </Text>
        </View>
      )}
    </View>
  )
}

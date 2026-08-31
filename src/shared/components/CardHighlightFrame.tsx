import { useId, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'

type Props = {
  // Paradas do gradiente da moldura — SPECTRUM (ao vivo) ou METAL (patrocinado).
  stops: readonly [string, string, string]
  // Raio do card por baixo, pra moldura acompanhar o canto.
  radius?: number
}

/**
 * Moldura de destaque desenhada POR CIMA de um card: mini-glow (mesma linguagem
 * dos pins) mais o traço do gradiente. Preenche o pai posicionado e se mede
 * sozinha — `Rect` com "100%" não re-resolve quando a altura do container muda
 * (RNSVG/new arch) e a moldura ficava cortada no meio do card.
 */
export function CardHighlightFrame({ stops, radius = 12 }: Props) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)
  const gradientId = `card-frame-${useId().replace(/:/g, '')}`

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      onLayout={e => {
        const { width, height } = e.nativeEvent.layout
        setSize(prev =>
          prev?.w === width && prev?.h === height
            ? prev
            : { w: width, h: height },
        )
      }}
    >
      {!!size && (
        <Svg width={size.w} height={size.h}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={stops[0]} />
              <Stop offset="0.5" stopColor={stops[1]} />
              <Stop offset="1" stopColor={stops[2]} />
            </LinearGradient>
          </Defs>
          <Rect
            x={2}
            y={2}
            width={size.w - 4}
            height={size.h - 4}
            rx={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={6}
            strokeOpacity={0.2}
          />
          <Rect
            x={1.25}
            y={1.25}
            width={size.w - 2.5}
            height={size.h - 2.5}
            rx={radius + 0.5}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={2.5}
          />
        </Svg>
      )}
    </View>
  )
}

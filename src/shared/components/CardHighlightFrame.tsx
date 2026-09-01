import { useId, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg'
import {
  ticketOutlinePath,
  type OutlineNotch,
} from '@/shared/utils/ticketOutline'

type Props = {
  // Paradas do gradiente da moldura — SPECTRUM (ao vivo) ou METAL (patrocinado).
  stops: readonly [string, string, string]
  // Raio do card por baixo, pra moldura acompanhar o canto.
  radius?: number
  // Picote do card-ingresso. Sem ele a moldura é um retângulo arredondado — é
  // o caso do tile do perfil e do card de spot, que não têm recorte.
  notch?: OutlineNotch | null
}

/**
 * Moldura de destaque desenhada POR CIMA de um card: mini-glow (mesma linguagem
 * dos pins) mais o traço do gradiente. Preenche o pai posicionado e se mede
 * sozinha — `Rect` com "100%" não re-resolve quando a altura do container muda
 * (RNSVG/new arch) e a moldura ficava cortada no meio do card.
 */
export function CardHighlightFrame({ stops, radius = 12, notch }: Props) {
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
          {/* Os dois traços mantêm o raio cheio no recuo em que correm (não o
              encolhem como a aresta do card): a moldura foi ajustada no olho,
              e o `notch` só acrescenta o mergulho no picote. */}
          <Path
            d={ticketOutlinePath({
              width: size.w,
              height: size.h,
              radius,
              inset: 2,
              notch,
            })}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={6}
            strokeOpacity={0.2}
          />
          <Path
            d={ticketOutlinePath({
              width: size.w,
              height: size.h,
              radius: radius + 0.5,
              inset: 1.25,
              notch,
            })}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={2.5}
          />
        </Svg>
      )}
    </View>
  )
}

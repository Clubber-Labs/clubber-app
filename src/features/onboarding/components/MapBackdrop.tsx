import { StyleSheet, View, useWindowDimensions } from 'react-native'
import type { ReactElement } from 'react'
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg'
import { colors, SPECTRUM } from '@/shared/theme'
import { MapStreets, type Street } from './MapStreets'

type Props = {
  streets: Street[]
  // Via curva do bairro (path SVG em px da janela) — o que tira o ar de grade.
  curve?: (w: number, h: number) => string
  // Ids de gradiente são globais no react-native-svg: um por instância, senão
  // os dois backdrops montados no pager disputam a mesma definição.
  fadeId: string
  children?: ReactElement[] | ReactElement
}

// Fundo de mapa "meia-noite" full-bleed (slides 2 e 3): tinge o background
// com uma lâmina do azul do espectro (~7%), ruas por cima e um fade que
// escurece a base até se fundir com a área do texto.
export function MapBackdrop({ streets, curve, fadeId, children }: Props) {
  const { width, height } = useWindowDimensions()
  return (
    // overflow hidden: as ruas sobram das bordas de propósito (pra rotação
    // atravessar a tela) — sem o clip elas vazam pros slides vizinhos do pager.
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.background },
        ]}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: SPECTRUM[2], opacity: 0.07 },
        ]}
      />
      <MapStreets streets={streets} />
      {curve && (
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Path
            d={curve(width, height)}
            stroke={colors.lineStrong}
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      )}
      {children}
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id={fadeId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0.3" stopColor={colors.background} stopOpacity={0} />
            <Stop offset="0.68" stopColor={colors.background} stopOpacity={1} />
            <Stop offset="1" stopColor={colors.background} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${fadeId})`} />
      </Svg>
      {/* Base sólida por garantia: o rodapé do fade em SVG já falhou em
          Release — faixa de ruas ressurgindo logo acima dos controles. */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '26%',
          backgroundColor: colors.background,
        }}
      />
    </View>
  )
}

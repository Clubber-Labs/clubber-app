import { useState } from 'react'
import { View, StyleSheet, type LayoutChangeEvent } from 'react-native'
import Svg, { Line } from 'react-native-svg'
import { colors } from '@/shared/theme'

export const NOTCH_RADIUS = 16
export const PERFORATION_HEIGHT = NOTCH_RADIUS * 2 + 2
const CY = PERFORATION_HEIGHT / 2
/**
 * Quanto o picote AVANÇA por cima da capa (a margem negativa abaixo). A capa
 * precisa reservar essa altura no rodapé, senão o recorte é desenhado em cima
 * do último elemento dela — foi assim que a barra de local passou a vazar por
 * baixo do tracejado.
 */
export const PERFORATION_OVERLAP = CY
// Respiro entre o furo e o primeiro traço, pra o tracejado não encostar no arco.
const DASH_GAP = 6

/**
 * O corte do picote — SÓ o tracejado. Os furos e o contorno em volta deles são
 * do EventCardOutline, que desenha a aresta inteira do card num traçado só: ter
 * dois donos da mesma borda foi o que fez a linha passar reta pelo recorte.
 */
type Props = {
  // Onde o corte caiu, em coordenadas do card — o contorno precisa disso pra
  // pousar os furos na mesma altura. Reportado DAQUI, e não de um wrapper: a
  // margem negativa abaixo é do picote, então só a medida dele já a embute.
  onCenterChange?: (y: number) => void
}

export function EventCardPerforation({ onCenterChange }: Props) {
  const [width, setWidth] = useState(0)

  function handleLayout(e: LayoutChangeEvent) {
    const { width: next, y } = e.nativeEvent.layout
    setWidth(current => (current === next ? current : next))
    onCenterChange?.(y + CY)
  }

  return (
    // A faixa CAVALGA a emenda: sobe metade da própria altura pra o centro dos
    // furos cair exatamente onde a capa termina. Sem isso o recorte nasce
    // inteiro abaixo da imagem e ela parece morrer em cima do picote, não no
    // meio dele — que é onde um ingresso de verdade se rasga.
    <View
      style={{ height: PERFORATION_HEIGHT, marginTop: -CY }}
      onLayout={handleLayout}
    >
      {width > 0 && (
        <Svg
          width={width}
          height={PERFORATION_HEIGHT}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          {/* Tracejado mais claro que os arcos: o corte é o convite ao gesto e
              precisa se ler; o contorno do furo é só acabamento. Mesma dupla de
              tokens que o EventTicketCard já usa. */}
          <Line
            x1={NOTCH_RADIUS + DASH_GAP}
            y1={CY}
            x2={width - NOTCH_RADIUS - DASH_GAP}
            y2={CY}
            stroke={colors.lineStrong}
            strokeWidth={1}
            strokeDasharray={[4, 5]}
          />
        </Svg>
      )}
    </View>
  )
}

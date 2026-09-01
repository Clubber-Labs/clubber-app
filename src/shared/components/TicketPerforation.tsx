import { useState } from 'react'
import { View, StyleSheet, type LayoutChangeEvent } from 'react-native'
import Svg, { Line } from 'react-native-svg'
import { colors } from '@/shared/theme'

// Raio do furo no card do feed. Cards mais estreitos (tile do perfil) passam o
// próprio raio, senão o furo come metade da largura.
export const NOTCH_RADIUS = 16
// Respiro entre o furo e o primeiro traço, pra o tracejado não encostar no arco.
const DASH_GAP = 6

/**
 * Quanto o picote AVANÇA por cima da capa (a margem negativa abaixo). A capa
 * precisa reservar essa altura no rodapé, senão o recorte é desenhado em cima
 * do último elemento dela — foi assim que a barra de local passou a vazar por
 * baixo do tracejado.
 */
export function perforationOverlap(radius: number) {
  return radius + 1
}
export const PERFORATION_OVERLAP = perforationOverlap(NOTCH_RADIUS)

/**
 * O corte do picote — SÓ o tracejado. Os furos e o contorno em volta deles são
 * do TicketOutline, que desenha a aresta inteira do card num traçado só: ter
 * dois donos da mesma borda foi o que fez a linha passar reta pelo recorte.
 */
type Props = {
  radius?: number
  // Onde o corte caiu, em coordenadas do card — o contorno precisa disso pra
  // pousar os furos na mesma altura. Reportado DAQUI, e não de um wrapper: a
  // margem negativa abaixo é do picote, então só a medida dele já a embute.
  onCenterChange?: (y: number) => void
}

export function TicketPerforation({
  radius = NOTCH_RADIUS,
  onCenterChange,
}: Props) {
  const [width, setWidth] = useState(0)
  const height = radius * 2 + 2
  const cy = perforationOverlap(radius)

  function handleLayout(e: LayoutChangeEvent) {
    const { width: next, y } = e.nativeEvent.layout
    setWidth(current => (current === next ? current : next))
    onCenterChange?.(y + cy)
  }

  return (
    // A faixa CAVALGA a emenda: sobe metade da própria altura pra o centro dos
    // furos cair exatamente onde a capa termina. Sem isso o recorte nasce
    // inteiro abaixo da imagem e ela parece morrer em cima do picote, não no
    // meio dele — que é onde um ingresso de verdade se rasga.
    <View style={{ height, marginTop: -cy }} onLayout={handleLayout}>
      {width > 0 && (
        <Svg
          width={width}
          height={height}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          {/* Tracejado mais claro que os arcos: o corte é o convite ao gesto e
              precisa se ler; o contorno do furo é só acabamento. Mesma dupla de
              tokens que o EventTicketCard já usa. */}
          <Line
            x1={radius + DASH_GAP}
            y1={cy}
            x2={width - radius - DASH_GAP}
            y2={cy}
            stroke={colors.lineStrong}
            strokeWidth={1}
            strokeDasharray={[4, 5]}
          />
        </Svg>
      )}
    </View>
  )
}

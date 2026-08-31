import { StyleSheet } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import { colors } from '@/shared/theme'

type Props = {
  width: number
  height: number
  // Ponta do balão dentro da capa — é onde o rastro termina.
  target: { x: number; y: number }
}

// Origem no canto inferior-esquerdo, acima da faixa de vidro.
const ORIGIN_X = 22
const ORIGIN_FROM_BOTTOM = 74
const DOT_RADIUS = 2.5

/**
 * Rastro pontilhado do canto até o balão. É decorativo — sugere "de você até
 * lá" sem prometer rota: não existe roteamento por trás, e a curva é a mesma
 * para qualquer distância.
 */
export function SpotRouteTrail({ width, height, target }: Props) {
  const originY = height - ORIGIN_FROM_BOTTOM
  // Controle puxado pra baixo do segmento reto: a barriga da curva sai por
  // baixo, longe do texto que fica no topo da capa.
  const controlX = ORIGIN_X + (target.x - ORIGIN_X) * 0.35
  const controlY = originY + 16

  return (
    <Svg
      width={width}
      height={height}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Path
        d={`M ${ORIGIN_X} ${originY} Q ${controlX} ${controlY} ${target.x} ${target.y}`}
        fill="none"
        stroke={colors.contentMuted}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="1 7"
      />
      <Circle
        cx={ORIGIN_X}
        cy={originY}
        r={DOT_RADIUS}
        fill={colors.contentMuted}
      />
    </Svg>
  )
}

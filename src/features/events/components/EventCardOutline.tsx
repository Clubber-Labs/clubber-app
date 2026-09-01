import { StyleSheet } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import { NOTCH_RADIUS } from './EventCardPerforation'
import { ticketOutlinePath } from '@/shared/utils/ticketOutline'
import { colors } from '@/shared/theme'

type Props = {
  width: number
  height: number
  // Centro dos furos, em coordenadas do card — vem do layout real do picote,
  // que depende da altura da capa.
  notchY: number
}

// Raio do card (rounded-xl).
const CARD_RADIUS = 12
// O stroke do SVG é centrado no caminho: meio pixel ficaria fora do viewport se
// o caminho corresse na borda exata.
const STROKE_INSET = 0.5

/**
 * A aresta do card. Existe porque `border` do RN não serve aqui: filho de View
 * com borda é inset pela largura dela, então o furo nascia 1px pra dentro e a
 * linha passava reta por fora, sem acompanhar o recorte — e cobrir a borda pelo
 * filho diverge entre iOS (CALayer desenha por cima) e Android (por baixo).
 *
 * O traçado em si é o `ticketOutlinePath`, o mesmo que a moldura de destaque
 * usa — as duas precisam mergulhar no picote pelo mesmo caminho.
 */
export function EventCardOutline({ width, height, notchY }: Props) {
  return (
    <Svg
      width={width}
      height={height}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      {/* Os furos vazam o fundo da página por cima do card (e por cima da capa,
          já que o recorte cavalga a emenda). Centrados no MESMO ponto dos arcos:
          assim o traço de 1px monta em cima da borda do preenchimento em vez de
          encostar nela, que é o que deixava um fiapo na emenda. */}
      <Circle cx={0} cy={notchY} r={NOTCH_RADIUS} fill={colors.background} />
      <Circle
        cx={width}
        cy={notchY}
        r={NOTCH_RADIUS}
        fill={colors.background}
      />
      <Path
        d={ticketOutlinePath({
          width,
          height,
          // O raio encolhe junto com o recuo: recuar um retângulo arredondado
          // em d sem tirar d do raio deixa os cantos DESALINHADOS do clip do
          // card (rounded-xl). A diferença é meio pixel, e é por ela que a cor
          // da capa escapava por fora do traço nos cantos.
          radius: CARD_RADIUS - STROKE_INSET,
          inset: STROKE_INSET,
          notch: { y: notchY, radius: NOTCH_RADIUS },
        })}
        fill="none"
        stroke={colors.line}
        strokeWidth={1}
      />
    </Svg>
  )
}

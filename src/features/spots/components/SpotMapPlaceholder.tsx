import { StyleSheet } from 'react-native'
import Svg, { Line } from 'react-native-svg'
import { colors } from '@/shared/theme'

// Malha irregular de quarteirões em coordenadas do viewBox 100×100 — nada de
// grid regular, que lê como tabela e não como mapa.
const VERTICAL = [18, 39, 62, 84]
const HORIZONTAL = [24, 52, 77]

/**
 * Padrão neutro no lugar do mini-mapa enquanto o snapshot é gerado (ou quando
 * não há SDK nativo pra gerá-lo). Não imita um mapa de verdade: só sugere
 * traçado urbano pra caixa não ficar um vazio chapado.
 */
export function SpotMapPlaceholder() {
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      pointerEvents="none"
    >
      {VERTICAL.map(x => (
        <Line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x + 4}
          y2={100}
          stroke={colors.contentFaint}
          strokeOpacity={0.22}
          strokeWidth={0.8}
        />
      ))}
      {HORIZONTAL.map(y => (
        <Line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={100}
          y2={y - 3}
          stroke={colors.contentFaint}
          strokeOpacity={0.22}
          strokeWidth={0.8}
        />
      ))}
    </Svg>
  )
}

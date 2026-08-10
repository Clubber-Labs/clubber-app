import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { HEADER_BAR_HEIGHT } from '../components/GlobalHeader'

// Distância do topo da tela até logo abaixo do header flutuante (+ folga).
// Só faz sentido nas abas, onde o header cobre a status bar e o conteúdo
// passa por baixo do vidro.
export function useHeaderClearance(gap = 12) {
  const insets = useSafeAreaInsets()
  return insets.top + HEADER_BAR_HEIGHT + gap
}

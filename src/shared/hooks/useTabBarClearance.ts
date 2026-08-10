import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  TAB_BAR_BOTTOM_MARGIN,
  TAB_BAR_HEIGHT,
} from '../components/GlassTabBar'

// Distância do fundo da tela até logo acima da pílula flutuante (+ folga).
// Âncora de FABs, cards e paddings de lista nas telas com tab bar — sem isso
// o conteúdo interativo termina embaixo do vidro.
export function useTabBarClearance(gap = 12) {
  const insets = useSafeAreaInsets()
  return insets.bottom + TAB_BAR_BOTTOM_MARGIN + TAB_BAR_HEIGHT + gap
}

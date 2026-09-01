import { useSegments } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  TAB_BAR_BOTTOM_MARGIN,
  TAB_BAR_COMPACT_HEIGHT,
  TAB_BAR_HEIGHT,
} from '../components/GlassTabBar'
import { isProfileTab } from '../utils/tabRoutes'

// Distância do fundo da tela até logo acima da pílula flutuante (+ folga).
// Âncora de FABs, cards e paddings de lista nas telas com tab bar — sem isso
// o conteúdo interativo termina embaixo do vidro. No Perfil a pílula é
// compacta e a distância acompanha.
export function useTabBarClearance(gap = 12) {
  const insets = useSafeAreaInsets()
  const segments = useSegments() as string[]
  const height = isProfileTab(segments)
    ? TAB_BAR_COMPACT_HEIGHT
    : TAB_BAR_HEIGHT
  return insets.bottom + TAB_BAR_BOTTOM_MARGIN + height + gap
}

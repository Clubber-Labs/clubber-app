import { Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/shared/theme'

type Props = {
  onPress: () => void
}

// FAB "gerar rolê" do mapa — abre o painel de sugestões da IA na metade de
// baixo da tela. Fica acima do FloatingCreateButton (criar evento).
export function GenerateSpotsButton({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Gerar sugestões de rolê"
      className="absolute bottom-24 right-6 w-14 h-14 rounded-full bg-surface border border-brand items-center justify-center shadow-lg"
      style={{
        shadowColor: colors.background,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <Ionicons name="sparkles" size={24} color={colors.brandText} />
    </Pressable>
  )
}

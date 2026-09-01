import { Pressable } from 'react-native'
import type { Icon } from 'phosphor-react-native'
import { colors } from '@/shared/theme'
import { useTabBarClearance } from '@/shared/hooks/useTabBarClearance'

type Props = {
  icon: Icon
  accessibilityLabel: string
  onPress: () => void
}

// Botão flutuante das abas: círculo branco ancorado acima da tab bar. Quem
// decide o que ele faz é a tela (seletor de criar no feed/mapa, postar foto
// direto no perfil).
export function Fab({ icon: FabIcon, accessibilityLabel, onPress }: Props) {
  const tabBarClearance = useTabBarClearance()

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="absolute right-4 h-14 w-14 items-center justify-center rounded-full bg-content"
      style={{
        bottom: tabBarClearance,
        shadowColor: colors.background,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <FabIcon size={28} color={colors.background} />
    </Pressable>
  )
}

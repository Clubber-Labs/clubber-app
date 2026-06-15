import { Pressable, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/shared/theme'

type Props = {
  onPress: () => void
}

export function EditProfileButton({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="h-11 flex-row items-center justify-center gap-2 rounded-lg bg-surface-elevated"
    >
      <Ionicons
        name="create-outline"
        size={18}
        color={colors.contentSecondary}
      />
      <Text className="text-content-secondary text-sm font-bold">
        Editar perfil
      </Text>
    </Pressable>
  )
}

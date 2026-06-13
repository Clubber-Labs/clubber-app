import { View, Text, Pressable, Linking } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/shared/theme'

type Props = {
  message: string
}

// Consentimento dado mas permissão negada no SISTEMA: degrada graciosamente
// (a central in-app segue funcionando) e oferece o caminho pros ajustes do SO.
export function OsPermissionWarning({ message }: Props) {
  return (
    <View className="flex-row items-center gap-3 px-4 py-3 border-t border-line">
      <Ionicons name="alert-circle-outline" size={18} color={colors.warning} />
      <Text className="flex-1 text-xs text-warning-text leading-4">
        {message}
      </Text>
      <Pressable onPress={() => Linking.openSettings()} className="py-1">
        <Text className="text-xs font-semibold text-brand-text">
          Abrir ajustes
        </Text>
      </Pressable>
    </View>
  )
}

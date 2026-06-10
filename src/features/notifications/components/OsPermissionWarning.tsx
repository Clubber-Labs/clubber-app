import { View, Text, Pressable, Linking } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type Props = {
  message: string
}

// Consentimento dado mas permissão negada no SISTEMA: degrada graciosamente
// (a central in-app segue funcionando) e oferece o caminho pros ajustes do SO.
export function OsPermissionWarning({ message }: Props) {
  return (
    <View className="flex-row items-center gap-3 px-4 py-3 border-t border-zinc-800">
      <Ionicons name="alert-circle-outline" size={18} color="#fbbf24" />
      <Text className="flex-1 text-xs text-amber-200 leading-4">{message}</Text>
      <Pressable onPress={() => Linking.openSettings()} className="py-1">
        <Text className="text-xs font-semibold text-violet-400">
          Abrir ajustes
        </Text>
      </Pressable>
    </View>
  )
}

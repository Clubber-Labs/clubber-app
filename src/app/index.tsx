import { View } from 'react-native'
import { Redirect } from 'expo-router'
import { useAuthStore } from '@/features/auth/store/authStore'

export default function Index() {
  const status = useAuthStore(s => s.status)

  // 'loading'/'offline' são cobertos pelos overlays do _layout — não redireciona
  // pro login enquanto valida a sessão ou está offline no boot.
  if (status === 'loading' || status === 'offline') {
    return <View className="flex-1 bg-background" />
  }

  if (status === 'authenticated') {
    return <Redirect href="/(tabs)/feed" />
  }

  return <Redirect href="/(auth)/login" />
}

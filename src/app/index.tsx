import { View } from 'react-native'
import { Redirect } from 'expo-router'
import { useAuthStore } from '@/features/auth/store/authStore'

export default function Index() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const hydrated = useAuthStore(s => s.hydrated)

  if (!hydrated) return <View className="flex-1 bg-black" />

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/feed" />
  }

  return <Redirect href="/(auth)/login" />
}

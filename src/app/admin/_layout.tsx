import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { useIsAdmin } from '@/features/reports/hooks/useIsAdmin'

// Guarda da área de moderação: só ADMIN (via /users/me) entra. Enquanto valida o
// papel mostra spinner; não-admin é redirecionado pro feed. Dupla proteção — o
// item de menu também só aparece para ADMIN.
export default function AdminLayout() {
  const router = useRouter()
  const { isAdmin, isLoading } = useIsAdmin()

  useEffect(() => {
    if (!isLoading && !isAdmin) router.replace('/(tabs)/feed')
  }, [isLoading, isAdmin, router])

  if (isLoading || !isAdmin) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    )
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
      }}
    />
  )
}

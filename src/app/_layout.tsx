import '@/global.css'
import '@/shared/lib/reactotron'
import '@/shared/lib/mapbox'
import { useEffect } from 'react'
import { View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import { Ionicons } from '@expo/vector-icons'
import { Toaster } from 'sonner-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { queryClient } from '@/shared/lib/queryClient'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useRestoreSession } from '@/features/auth/hooks/useRestoreSession'
import { GlobalHeader } from '@/shared/components/GlobalHeader'

function AuthGuard() {
  useRestoreSession()

  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const hydrated = useAuthStore(s => s.hydrated)
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (!hydrated) return

    const inAuthGroup = segments[0] === '(auth)'
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)/feed')
    }
  }, [hydrated, isAuthenticated, segments, router])

  return null
}

export default function RootLayout() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const hydrated = useAuthStore(s => s.hydrated)
  useFonts(Ionicons.font)

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <SafeAreaView
            style={{ flex: 1, backgroundColor: '#000000' }}
            edges={['top']}
          >
            {hydrated && isAuthenticated && <GlobalHeader />}
            <View className="flex-1 bg-black">
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: '#000000' },
                }}
              />
            </View>
          </SafeAreaView>
          <AuthGuard />
          <Toaster position="top-center" theme="dark" richColors />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

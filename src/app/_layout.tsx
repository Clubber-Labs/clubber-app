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
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { queryClient } from '@/shared/lib/queryClient'
import { ConfirmProvider } from '@/shared/lib/confirm'
import { BannerProvider } from '@/shared/lib/banner'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useRestoreSession } from '@/features/auth/hooks/useRestoreSession'
import { initFacebookSDK } from '@/features/auth/lib/facebookLogin'
import { GlobalHeader } from '@/shared/components/GlobalHeader'

function AuthGuard() {
  useRestoreSession()

  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const hydrated = useAuthStore(s => s.hydrated)
  const profileIncomplete = useAuthStore(s => s.profileIncomplete)
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (!hydrated) return

    const inAuthGroup = segments[0] === '(auth)'
    const onCompleteProfile =
      inAuthGroup && (segments as string[])[1] === 'complete-profile'

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (isAuthenticated && profileIncomplete && !onCompleteProfile) {
      router.replace('/(auth)/complete-profile')
    } else if (isAuthenticated && !profileIncomplete && inAuthGroup) {
      router.replace('/(tabs)/feed')
    }
  }, [hydrated, isAuthenticated, profileIncomplete, segments, router])

  return null
}

export default function RootLayout() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const hydrated = useAuthStore(s => s.hydrated)
  const profileIncomplete = useAuthStore(s => s.profileIncomplete)
  useFonts(Ionicons.font)

  useEffect(() => {
    // GoogleSignin.configure() é lazy (chamado no 1º signIn). Facebook precisa
    // de inicialização explícita pra registrar handlers nativos antes do 1º tap.
    initFacebookSDK()
  }, [])

  // Esconde GlobalHeader durante o fluxo de completar perfil — a tela
  // ainda está em (auth), mas isAuthenticated já é true.
  const showHeader = hydrated && isAuthenticated && !profileIncomplete

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ConfirmProvider>
            <BannerProvider>
              <StatusBar style="light" />
              <SafeAreaView
                style={{ flex: 1, backgroundColor: '#000000' }}
                edges={['top']}
              >
                {showHeader && <GlobalHeader />}
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
            </BannerProvider>
          </ConfirmProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

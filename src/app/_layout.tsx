import '@/global.css'
import '@/shared/lib/reactotron'
import '@/shared/lib/mapbox'
import { useCallback, useEffect } from 'react'
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
import { OpenInMapsProvider } from '@/shared/lib/openInMaps'
import { BannerProvider } from '@/shared/lib/banner'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useRestoreSession } from '@/features/auth/hooks/useRestoreSession'
import { endSession } from '@/features/auth/lib/session'
import { initFacebookSDK } from '@/features/auth/lib/facebookLogin'
import { SessionUnavailable } from '@/features/auth/components/SessionUnavailable'
import { ChatRealtimeMount } from '@/features/chat/components/ChatRealtimeMount'
import { GlobalHeader } from '@/shared/components/GlobalHeader'

// Redirecionamentos por status. 'loading'/'offline' são tratados pelos overlays
// no RootLayout (não navega), pra não jogar o usuário no login enquanto valida
// ou está offline no boot.
function AuthGuard() {
  const status = useAuthStore(s => s.status)
  const profileIncomplete = useAuthStore(s => s.profileIncomplete)
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading' || status === 'offline') return

    const inAuthGroup = segments[0] === '(auth)'
    const onCompleteProfile =
      inAuthGroup && (segments as string[])[1] === 'complete-profile'

    if (status === 'unauthenticated' && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (
      status === 'authenticated' &&
      profileIncomplete &&
      !onCompleteProfile
    ) {
      router.replace('/(auth)/complete-profile')
    } else if (status === 'authenticated' && !profileIncomplete && inAuthGroup) {
      router.replace('/(tabs)/feed')
    }
  }, [status, profileIncomplete, segments, router])

  return null
}

export default function RootLayout() {
  const { retry } = useRestoreSession()
  const status = useAuthStore(s => s.status)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const profileIncomplete = useAuthStore(s => s.profileIncomplete)
  const userId = useAuthStore(s => s.userId)
  useFonts(Ionicons.font)

  useEffect(() => {
    // GoogleSignin.configure() é lazy (chamado no 1º signIn). Facebook precisa
    // de inicialização explícita pra registrar handlers nativos antes do 1º tap.
    initFacebookSDK()
  }, [])

  // 4401 no socket = token inválido e sem rota de refresh → encerra a sessão
  // (mesmo caminho do interceptor REST 401).
  const handleChatAuthError = useCallback(() => {
    endSession({ expired: true })
  }, [])

  // Esconde GlobalHeader durante o fluxo de completar perfil — a tela
  // ainda está em (auth), mas isAuthenticated já é true.
  const showHeader = isAuthenticated && !profileIncomplete
  const chatActive = isAuthenticated && !profileIncomplete && !!userId

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ConfirmProvider>
            <OpenInMapsProvider>
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
                    {/* Gate de sessão: bloqueia as telas até /me validar. */}
                    {status === 'loading' && (
                      <View className="absolute inset-0 bg-black" />
                    )}
                    {status === 'offline' && (
                      <SessionUnavailable onRetry={retry} />
                    )}
                  </View>
                </SafeAreaView>
                <AuthGuard />
                {chatActive && userId && (
                  <ChatRealtimeMount
                    myId={userId}
                    onAuthError={handleChatAuthError}
                  />
                )}
              </BannerProvider>
            </OpenInMapsProvider>
          </ConfirmProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

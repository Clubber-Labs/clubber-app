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
import {
  useConsentStore,
  selectNeedsConsent,
  selectNeedsVersionBump,
  selectConsentHydrated,
} from '@/features/privacy/store/consentStore'
import { CONSENT_VERSION } from '@/features/privacy/services/consentService'
import { useRestoreSession } from '@/features/auth/hooks/useRestoreSession'
import { endSession } from '@/features/auth/lib/session'
import { initFacebookSDK } from '@/features/auth/lib/facebookLogin'
import { SessionUnavailable } from '@/features/auth/components/SessionUnavailable'
import { ChatRealtimeMount } from '@/features/chat/components/ChatRealtimeMount'
import { NotificationsMount } from '@/features/notifications/components/NotificationsMount'
import { GlobalHeader } from '@/shared/components/GlobalHeader'

// Redirecionamentos por status. 'loading'/'offline' são tratados pelos overlays
// no RootLayout (não navega), pra não jogar o usuário no login enquanto valida
// ou está offline no boot.
function AuthGuard() {
  const status = useAuthStore(s => s.status)
  const profileIncomplete = useAuthStore(s => s.profileIncomplete)
  const segments = useSegments()
  const router = useRouter()

  const needsConsent = useConsentStore(selectNeedsConsent)
  const needsVersionBump = useConsentStore(s =>
    selectNeedsVersionBump(s, CONSENT_VERSION),
  )

  useEffect(() => {
    if (status === 'loading' || status === 'offline') return

    const inAuthGroup = segments[0] === '(auth)'
    const onCompleteProfile =
      inAuthGroup && (segments as string[])[1] === 'complete-profile'
    const onConsentScreen =
      inAuthGroup && (segments as string[])[1] === 'consent'

    if (status === 'unauthenticated' && !inAuthGroup) {
      router.replace('/(auth)/login')
      return
    }

    if (status === 'authenticated' && profileIncomplete && !onCompleteProfile) {
      router.replace('/(auth)/complete-profile')
      return
    }

    // Gate de consentimento: usuário autenticado com perfil completo mas sem consentimento
    // (novo usuário) ou com versão desatualizada (version bump) → tela de consent.
    if (
      status === 'authenticated' &&
      !profileIncomplete &&
      (needsConsent || needsVersionBump) &&
      !onConsentScreen
    ) {
      router.replace('/(auth)/consent')
      return
    }

    // Autenticado, com perfil e consentimento OK → sai do grupo auth
    if (
      status === 'authenticated' &&
      !profileIncomplete &&
      !needsConsent &&
      !needsVersionBump &&
      inAuthGroup
    ) {
      router.replace('/(tabs)/feed')
    }
  }, [
    status,
    profileIncomplete,
    needsConsent,
    needsVersionBump,
    segments,
    router,
  ])

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

  // 4401 em qualquer socket (chat/notificações) = token inválido e sem rota
  // de refresh → encerra a sessão (mesmo caminho do interceptor REST 401).
  const handleSocketAuthError = useCallback(() => {
    endSession({ expired: true })
  }, [])

  // Esconde GlobalHeader durante o fluxo de completar perfil — a tela
  // ainda está em (auth), mas isAuthenticated já é true.
  const consentHydrated = useConsentStore(selectConsentHydrated)
  const needsConsentRoot = useConsentStore(selectNeedsConsent)
  const needsVersionBumpRoot = useConsentStore(s =>
    selectNeedsVersionBump(s, CONSENT_VERSION),
  )
  const onConsentFlow =
    !consentHydrated || needsConsentRoot || needsVersionBumpRoot
  const showHeader = isAuthenticated && !profileIncomplete && !onConsentFlow
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
                  <>
                    <ChatRealtimeMount
                      myId={userId}
                      onAuthError={handleSocketAuthError}
                    />
                    <NotificationsMount onAuthError={handleSocketAuthError} />
                  </>
                )}
              </BannerProvider>
            </OpenInMapsProvider>
          </ConfirmProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

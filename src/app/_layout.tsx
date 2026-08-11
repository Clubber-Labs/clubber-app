import '@/global.css'
import '@/shared/lib/reactotron'
import '@/shared/lib/mapbox'
import { useCallback, useEffect } from 'react'
import { View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClientProvider } from '@tanstack/react-query'
import { StripeProvider } from '@stripe/stripe-react-native'
import Constants from 'expo-constants'
import { useFonts, Sora_700Bold } from '@expo-google-fonts/sora'
import * as ExpoSplash from 'expo-splash-screen'
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
import { SplashOverlay } from '@/shared/components/SplashOverlay'
import { colors } from '@/shared/theme'

// Segura a splash nativa (b reto) até a splash JS montar — o hideAsync roda no
// primeiro frame do overlay (onMounted), sem flash preto na troca.
ExpoSplash.preventAutoHideAsync().catch(() => {})

// Redirecionamentos por status. 'loading'/'offline' são tratados pelos overlays
// no RootLayout (não navega), pra não jogar o usuário no login enquanto valida
// ou está offline no boot.
function AuthGuard() {
  const status = useAuthStore(s => s.status)
  const profileIncomplete = useAuthStore(s => s.profileIncomplete)
  const onboardingSeen = useAuthStore(s => s.onboardingSeen)
  const sessionExpired = useAuthStore(s => s.sessionExpired)
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
      // Sessão expirada vai direto pro login (banner "sessão expirou" mora lá);
      // onboarding é só pra quem nunca o viu neste aparelho.
      router.replace(
        sessionExpired || onboardingSeen
          ? '/(auth)/login'
          : '/(auth)/onboarding',
      )
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
    onboardingSeen,
    sessionExpired,
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
  const segments = useSegments() as string[]
  const [fontsLoaded] = useFonts({ Sora_700Bold })
  // Splash global SÓ no boot: fontes carregando ou sessão indefinida. Nunca em
  // logout, navegação, resume ou loading local — e o fade de saída de 200ms dá
  // ao wordmark (que espera a fonte) seu momento mesmo quando a fonte é a
  // última a resolver.
  const showSplash = !fontsLoaded || status === 'loading'

  const hideNativeSplash = useCallback(() => {
    ExpoSplash.hideAsync().catch(() => {})
  }, [])

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
  // Detalhe do evento usa hero imersivo (sob a status bar) com botões
  // flutuantes próprios — esconde o header global e tira o inset do topo só
  // nessa rota (events/[id], sem subrotas como edit/invites).
  const isEventDetail =
    segments[0] === 'events' && segments[1] === '[id]' && segments.length === 2
  // Onboarding tem mapa full-bleed sob a status bar/Dynamic Island — a tela
  // compensa o inset no próprio header (useSafeAreaInsets).
  const isOnboarding =
    segments[0] === '(auth)' && (segments as string[])[1] === 'onboarding'
  // Telas de billing (upgrade/manage) têm header próprio (fechar/voltar) —
  // o header global em cima seria redundante.
  const isBilling = segments[0] === 'billing'
  // Telas com header próprio (voltar + título + ações) — o header global em
  // cima seria redundante. Notificações tem cabeçalho com "Marcar lidas" +
  // ajustes.
  const isNotifications = segments[0] === 'notifications'
  // Editar perfil é hub + telas focadas, cada uma com voltar/título/Salvar
  // próprios — o header global em cima seria redundante.
  const isProfileEdit = segments[0] === 'profile' && segments[1] === 'edit'
  const showHeader =
    isAuthenticated &&
    !profileIncomplete &&
    !onConsentFlow &&
    !isEventDetail &&
    !isBilling &&
    !isNotifications &&
    !isProfileEdit
  // Nas abas o header de vidro flutua edge-to-edge (cobre a status bar, o
  // conteúdo passa por baixo — clearance via useHeaderClearance). Nas telas
  // empilhadas ele fica no fluxo, com o inset do SafeAreaView.
  const floatingHeader = showHeader && segments[0] === '(tabs)'
  const chatActive = isAuthenticated && !profileIncomplete && !!userId

  // Publishable key é pública por natureza (pk_) — sem ela a PaymentSheet
  // falha no init com erro tratado na tela de upgrade, o resto do app segue.
  const stripePublishableKey: string =
    Constants.expoConfig?.extra?.stripePublishableKey ?? ''

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StripeProvider publishableKey={stripePublishableKey}>
            <ConfirmProvider>
              <OpenInMapsProvider>
                <BannerProvider>
                  <StatusBar style="light" />
                  <SafeAreaView
                    style={{ flex: 1, backgroundColor: colors.background }}
                    edges={
                      isEventDetail || floatingHeader || isOnboarding
                        ? []
                        : ['top']
                    }
                  >
                    {showHeader && !floatingHeader && <GlobalHeader />}
                    <View className="flex-1 bg-background">
                      <Stack
                        screenOptions={{
                          headerShown: false,
                          contentStyle: { backgroundColor: colors.background },
                        }}
                      />
                      {floatingHeader && (
                        <View className="absolute top-0 left-0 right-0">
                          <GlobalHeader floating />
                        </View>
                      )}
                      {status === 'offline' && (
                        <SessionUnavailable onRetry={retry} />
                      )}
                    </View>
                  </SafeAreaView>
                  <SplashOverlay
                    visible={showSplash}
                    showWordmark={fontsLoaded}
                    onMounted={hideNativeSplash}
                  />
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
          </StripeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

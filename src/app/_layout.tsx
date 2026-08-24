import '@/global.css'
import '@/shared/lib/reactotron'
import '@/shared/lib/mapbox'
import { useCallback, useEffect } from 'react'
import { View } from 'react-native'
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClientProvider } from '@tanstack/react-query'
import { StripeProvider } from '@stripe/stripe-react-native'
import Constants from 'expo-constants'
import {
  useFonts,
  Sora_700Bold,
  Sora_800ExtraBold,
} from '@expo-google-fonts/sora'
import * as ExpoSplash from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@/shared/i18n'
import { useLocaleHydrated } from '@/shared/hooks/useLocaleHydrated'
import { queryClient } from '@/shared/lib/queryClient'
import { ConfirmProvider } from '@/shared/lib/confirm'
import { OpenInMapsProvider } from '@/shared/lib/openInMaps'
import { BannerProvider } from '@/shared/lib/banner'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useRestoreSession } from '@/features/auth/hooks/useRestoreSession'
import { useConsentMirror } from '@/features/privacy/hooks/useConsentMirror'
import { PolicyUpdateNotice } from '@/features/privacy/components/PolicyUpdateNotice'
import { FirstRunPermissions } from '@/features/privacy/components/FirstRunPermissions'
import { endSession } from '@/features/auth/lib/session'
import { SessionUnavailable } from '@/features/auth/components/SessionUnavailable'
import { ChatRealtimeMount } from '@/features/chat/components/ChatRealtimeMount'
import { NotificationsMount } from '@/features/notifications/components/NotificationsMount'
import {
  GlobalHeader,
  HEADER_BAR_HEIGHT,
} from '@/shared/components/GlobalHeader'
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

  useEffect(() => {
    if (status === 'loading' || status === 'offline') return

    const inAuthGroup = segments[0] === '(auth)'
    const onCompleteProfile =
      inAuthGroup && (segments as string[])[1] === 'complete-profile'

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

    // Consentimento NÃO é portão: o registro já existe quando o usuário chega
    // (criado na transação do cadastro) e política nova vira aviso dispensável,
    // não bloqueio. Autenticado com perfil completo → app.
    if (status === 'authenticated' && !profileIncomplete && inAuthGroup) {
      router.replace('/(tabs)/map')
    }
  }, [
    status,
    profileIncomplete,
    onboardingSeen,
    sessionExpired,
    segments,
    router,
  ])

  return null
}

type Chrome = {
  topInset: 'nenhum' | 'statusBar' | 'statusBarComHeader'
  header: 'nenhum' | 'vidro' | 'solido'
}

// Cromo POR ROTA: quanto de topo a tela precisa e que header ela recebe. O
// inset vai no contentStyle de cada tela e o header é sempre absoluto, então a
// árvore acima do Stack tem geometria fixa. Enquanto isso morava na raiz (edges
// do SafeAreaView + header em fluxo), entrar numa tela empilhada mudava a altura
// do pai COMUM das duas telas da transição: a que estava saindo pulava
// insets.top + HEADER_BAR_HEIGHT pra baixo antes da nova aparecer, e na volta
// subia deixando uma faixa vazia embaixo.
function chromeFor(path: string): Chrome {
  // Abas: o header de vidro cobre a status bar e o conteúdo passa por baixo
  // (cada tela abre espaço com useHeaderClearance).
  if (path === '(tabs)' || path.startsWith('(tabs)/')) {
    return { topInset: 'nenhum', header: 'vidro' }
  }
  // Onboarding é full-bleed e as demais telas do grupo recebem o inset por tela
  // no (auth)/_layout.
  if (path.startsWith('(auth)')) return { topInset: 'nenhum', header: 'nenhum' }
  // Detalhe do evento: hero imersivo sob a status bar, com botões flutuantes
  // próprios (subrotas como edit/invites são telas normais).
  if (path === 'events/[id]') return { topInset: 'nenhum', header: 'nenhum' }
  // Telas com cabeçalho próprio (voltar + título + ações) — o global em cima
  // seria redundante.
  if (
    path === 'notifications' ||
    path.startsWith('billing/') ||
    path.startsWith('profile/edit')
  ) {
    return { topInset: 'statusBar', header: 'nenhum' }
  }
  return { topInset: 'statusBarComHeader', header: 'solido' }
}

export default function RootLayout() {
  const { retry } = useRestoreSession()
  useConsentMirror()
  const status = useAuthStore(s => s.status)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const profileIncomplete = useAuthStore(s => s.profileIncomplete)
  const userId = useAuthStore(s => s.userId)
  const segments = useSegments() as string[]
  const insets = useSafeAreaInsets()
  const [fontsLoaded, fontError] = useFonts({ Sora_700Bold, Sora_800ExtraBold })
  const localeHydrated = useLocaleHydrated()
  // Fonte que falha nunca vira `loaded` — sem contar o erro como desfecho, o app
  // ficaria preso na splash pra sempre.
  const fontsSettled = fontsLoaded || !!fontError
  // Splash global SÓ no boot: fonte, sessão indefinida ou idioma ainda não
  // hidratado. Nunca em logout, navegação, resume ou loading local.
  const showSplash = !fontsSettled || status === 'loading' || !localeHydrated

  // O overlay desenha a MESMA imagem que o SO já tem na tela, e ela vem do
  // bundle — não há o que esperar antes de esconder a nativa. Enquanto o overlay
  // recompunha a arte, isto precisava aguardar a Sora, senão o wordmark piscava.
  const hideNativeSplash = useCallback(() => {
    ExpoSplash.hideAsync().catch(() => {})
  }, [])

  // 4401 em qualquer socket (chat/notificações) = token inválido e sem rota
  // de refresh → encerra a sessão (mesmo caminho do interceptor REST 401).
  const handleSocketAuthError = useCallback(() => {
    endSession({ expired: true })
  }, [])

  // Sessão pronta = header global liberado. É a única parte do cromo que não sai
  // da rota, e só muda em login/logout — nunca no meio de uma transição.
  // Consentimento não entra mais aqui: deixou de ser etapa do fluxo de entrada.
  const sessionReady = isAuthenticated && !profileIncomplete
  const header = sessionReady ? chromeFor(segments.join('/')).header : 'nenhum'

  // O route.name do Stack raiz traz o /index das pastas sem layout próprio
  // (events/[id]/index); os segments, não — normaliza pros dois casarem.
  function topPaddingFor(routeName: string): number {
    const { topInset } = chromeFor(routeName.replace(/\/index$/, ''))
    if (topInset === 'nenhum') return 0
    if (topInset === 'statusBar' || !sessionReady) return insets.top
    return insets.top + HEADER_BAR_HEIGHT
  }

  const chatActive = isAuthenticated && !profileIncomplete && !!userId

  // Publishable key é pública por natureza (pk_) — sem ela a PaymentSheet
  // falha no init com erro tratado na tela de upgrade, o resto do app segue.
  const stripePublishableKey: string =
    Constants.expoConfig?.extra?.stripePublishableKey ?? ''

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* Acima do resto: ConfirmProvider e BannerProvider precisam de `t`. */}
        <I18nextProvider i18n={i18n}>
          <QueryClientProvider client={queryClient}>
            <StripeProvider publishableKey={stripePublishableKey}>
              <ConfirmProvider>
                <OpenInMapsProvider>
                  <BannerProvider>
                    <StatusBar style="light" />
                    {/* Raiz sem inset e header absoluto: a altura daqui pra baixo
                      não pode depender da rota (ver chromeFor). */}
                    <View className="flex-1 bg-background">
                      <Stack
                        screenOptions={({ route }) => ({
                          headerShown: false,
                          contentStyle: {
                            backgroundColor: colors.background,
                            paddingTop: topPaddingFor(route.name),
                          },
                        })}
                      />
                      {header !== 'nenhum' && (
                        <View className="absolute top-0 left-0 right-0">
                          <GlobalHeader floating={header === 'vidro'} />
                        </View>
                      )}
                      {status === 'offline' && (
                        <SessionUnavailable onRetry={retry} />
                      )}
                    </View>
                    <SplashOverlay
                      visible={showSplash}
                      onMounted={hideNativeSplash}
                    />
                    <AuthGuard />
                    {sessionReady && <PolicyUpdateNotice />}
                    {/* Depois da splash: o pedido abre num Modal, que sobe
                        acima do overlay — apareceria sobre a arte de boot. */}
                    {sessionReady && !showSplash && <FirstRunPermissions />}
                    {chatActive && userId && (
                      <>
                        <ChatRealtimeMount
                          myId={userId}
                          onAuthError={handleSocketAuthError}
                        />
                        <NotificationsMount
                          onAuthError={handleSocketAuthError}
                        />
                      </>
                    )}
                  </BannerProvider>
                </OpenInMapsProvider>
              </ConfirmProvider>
            </StripeProvider>
          </QueryClientProvider>
        </I18nextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

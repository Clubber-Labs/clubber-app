import { useEffect } from 'react'
import { View, Text, ScrollView, Pressable } from 'react-native'
import { Link, useLocalSearchParams, useRouter } from 'expo-router'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { AuthDivider } from '@/features/auth/components/AuthDivider'
import { SocialLoginButtons } from '@/features/auth/components/SocialLoginButtons'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useBanner } from '@/shared/lib/banner'
import { FormFocusProvider } from '@/shared/lib/formFocus'
import { useKeyboardAwareForm } from '@/shared/hooks/useKeyboardAwareForm'
import { deleteOnboardingSeen } from '@/shared/lib/secureStore'
import { BrandSticker } from '@/shared/components/brand'

export default function LoginScreen() {
  const params = useLocalSearchParams<{ email?: string }>()
  const defaultEmail =
    typeof params.email === 'string' ? params.email : undefined
  const sessionExpired = useAuthStore(s => s.sessionExpired)
  const acknowledgeExpired = useAuthStore(s => s.acknowledgeExpired)
  const setOnboardingSeen = useAuthStore(s => s.setOnboardingSeen)
  const showBanner = useBanner()
  const router = useRouter()
  const form = useKeyboardAwareForm()

  // Atalho escondido de rever a apresentação (útil pra QA em aparelho físico,
  // onde não dá pra limpar o Keychain por fora): segurar o sticker zera o
  // flag e reabre o onboarding. Sem affordance visual — o sticker não é botão.
  async function replayOnboarding() {
    await deleteOnboardingSeen()
    setOnboardingSeen(false)
    router.replace('/(auth)/onboarding')
  }

  // Sessão caiu por 401 → avisa uma vez e zera o flag (não repete ao revisitar).
  useEffect(() => {
    if (sessionExpired) {
      showBanner('Sua sessão expirou. Entre novamente.')
      acknowledgeExpired()
    }
  }, [sessionExpired, showBanner, acknowledgeExpired])

  return (
    <FormFocusProvider value={form}>
      <ScrollView
        {...form.scrollProps}
        className="flex-1 bg-background"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 24,
        }}
      >
        {/* Marca: sticker centrado — a única presença do b na tela. */}
        <View className="items-center mb-10">
          <Pressable onLongPress={replayOnboarding} delayLongPress={600}>
            <BrandSticker size={216} />
          </Pressable>
        </View>

        <Text className="text-3xl font-bold text-content mb-2">
          Bem-vindo de volta
        </Text>
        <Text className="text-content-muted mb-8">
          Entre na sua conta para continuar
        </Text>

        <LoginForm defaultEmail={defaultEmail} />

        <AuthDivider />

        <SocialLoginButtons />

        <View className="flex-row justify-center mt-6 gap-1">
          <Text className="text-content-muted">Não tem uma conta?</Text>
          <Link href="/(auth)/register">
            <Text className="text-brand-text font-semibold">Cadastre-se</Text>
          </Link>
        </View>
      </ScrollView>
    </FormFocusProvider>
  )
}

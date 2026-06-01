import { useEffect } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { Link } from 'expo-router'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { AuthDivider } from '@/features/auth/components/AuthDivider'
import { SocialLoginButtons } from '@/features/auth/components/SocialLoginButtons'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useBanner } from '@/shared/lib/banner'

export default function LoginScreen() {
  const sessionExpired = useAuthStore(s => s.sessionExpired)
  const acknowledgeExpired = useAuthStore(s => s.acknowledgeExpired)
  const showBanner = useBanner()

  // Sessão caiu por 401 → avisa uma vez e zera o flag (não repete ao revisitar).
  useEffect(() => {
    if (sessionExpired) {
      showBanner('Sua sessão expirou. Entre novamente.')
      acknowledgeExpired()
    }
  }, [sessionExpired, showBanner, acknowledgeExpired])

  return (
    <ScrollView
      className="flex-1 bg-black"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-3xl font-bold text-white mb-2">
        Bem-vindo de volta
      </Text>
      <Text className="text-zinc-400 mb-8">
        Entre na sua conta para continuar
      </Text>

      <LoginForm />

      <AuthDivider />

      <SocialLoginButtons />

      <View className="flex-row justify-center mt-6 gap-1">
        <Text className="text-zinc-400">Não tem uma conta?</Text>
        <Link href="/(auth)/register">
          <Text className="text-violet-400 font-semibold">Cadastre-se</Text>
        </Link>
      </View>
    </ScrollView>
  )
}

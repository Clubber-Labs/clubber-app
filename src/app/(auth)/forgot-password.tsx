import { ScrollView, View, Text } from 'react-native'
import { Link, useLocalSearchParams } from 'expo-router'
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'

export default function ForgotPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>()
  const defaultEmail =
    typeof params.email === 'string' ? params.email : undefined

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: 64,
        paddingBottom: 32,
        paddingHorizontal: 24,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-1">
        <ForgotPasswordForm defaultEmail={defaultEmail} />

        <View className="flex-row justify-center mt-6 gap-1">
          <Text className="text-content-muted">Lembrou a senha?</Text>
          <Link href="/(auth)/login">
            <Text className="text-brand-text font-semibold">Entrar</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  )
}

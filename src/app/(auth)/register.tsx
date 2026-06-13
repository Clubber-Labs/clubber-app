import { ScrollView, View, Text } from 'react-native'
import { Link } from 'expo-router'
import { RegisterForm } from '@/features/auth/components/RegisterForm'

export default function RegisterScreen() {
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
        <RegisterForm />

        <View className="flex-row justify-center mt-6 gap-1">
          <Text className="text-content-muted">Já tem uma conta?</Text>
          <Link href="/(auth)/login">
            <Text className="text-brand-text font-semibold">Entrar</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  )
}

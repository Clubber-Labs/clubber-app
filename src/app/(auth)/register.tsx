import { ScrollView, View, Text } from 'react-native'
import { Link } from 'expo-router'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { FormFocusProvider } from '@/shared/lib/formFocus'
import { useKeyboardAwareForm } from '@/shared/hooks/useKeyboardAwareForm'

export default function RegisterScreen() {
  const form = useKeyboardAwareForm()

  return (
    <FormFocusProvider value={form}>
      <ScrollView
        {...form.scrollProps}
        className="flex-1 bg-background"
        contentContainerStyle={{
          paddingTop: 64,
          paddingBottom: 32,
          paddingHorizontal: 24,
        }}
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
    </FormFocusProvider>
  )
}

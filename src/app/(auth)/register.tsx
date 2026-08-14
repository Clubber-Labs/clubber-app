import { ScrollView, View, Text } from 'react-native'
import { Link } from 'expo-router'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { BrandStickerWordmark, BrandWordmark } from '@/shared/components/brand'
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
          flexGrow: 1,
          paddingTop: 24,
          paddingBottom: 32,
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1">
          {/* Marca no lugar do respiro que já existia no topo — assina as cinco
              etapas sem empurrar o formulário. */}
          <View className="items-center mb-6">
            <BrandWordmark height={28} />
          </View>

          <RegisterForm />

          <View className="flex-row justify-center mt-6 gap-1">
            <Text className="text-content-muted">Já tem uma conta?</Text>
            <Link href="/(auth)/login">
              <Text className="text-brand-text font-semibold">Entrar</Text>
            </Link>
          </View>
        </View>

        {/* Margem automática no topo: cola o selo no rodapé quando sobra tela e
            some quando não sobra — nas etapas longas ele só segue o conteúdo. */}
        <View
          className="flex-row justify-center pt-20"
          style={{ marginTop: 'auto' }}
        >
          <BrandStickerWordmark height={12} />
        </View>
      </ScrollView>
    </FormFocusProvider>
  )
}

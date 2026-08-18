import { ScrollView, View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Link, useLocalSearchParams } from 'expo-router'
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'
import { FormFocusProvider } from '@/shared/lib/formFocus'
import { useKeyboardAwareForm } from '@/shared/hooks/useKeyboardAwareForm'

export default function ForgotPasswordScreen() {
  const { t } = useTranslation()
  const params = useLocalSearchParams<{ email?: string }>()
  const defaultEmail =
    typeof params.email === 'string' ? params.email : undefined
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
          <ForgotPasswordForm defaultEmail={defaultEmail} />

          <View className="flex-row justify-center mt-6 gap-1">
            <Text className="text-content-muted">
              {t('auth.forgotPassword.remembered')}
            </Text>
            <Link href="/(auth)/login">
              <Text className="text-brand-text font-semibold">
                {t('auth.register.signIn')}
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </FormFocusProvider>
  )
}

import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { CheckCircleIcon } from 'phosphor-react-native'
import { Button } from '@/shared/components/Button'
import { FormError } from '@/shared/components/FormError'
import { colors } from '@/shared/theme'

type Props = {
  isLoggingIn: boolean
  loginError: string | null
  onEnter: () => void
  onGoToLogin: () => void
}

export function StepSuccess({
  isLoggingIn,
  loginError,
  onEnter,
  onGoToLogin,
}: Props) {
  const { t } = useTranslation()
  return (
    <View className="gap-6 items-center pt-4">
      <View className="w-16 h-16 rounded-full bg-success-strong/20 items-center justify-center">
        <CheckCircleIcon size={48} color={colors.success} weight="fill" />
      </View>

      <View className="gap-1">
        <Text className="text-2xl font-bold text-content text-center">
          {t('auth.forgotPassword.success.title')}
        </Text>
        <Text className="text-sm text-content-muted text-center">
          {t('auth.forgotPassword.success.subtitle')}
        </Text>
      </View>

      <View className="w-full gap-3">
        <FormError message={loginError} />
        <Button
          label={
            isLoggingIn
              ? t('auth.forgotPassword.success.entering')
              : t('auth.forgotPassword.success.enter')
          }
          onPress={onEnter}
          loading={isLoggingIn}
        />
        {loginError && (
          <Button
            label={t('auth.forgotPassword.success.goToLogin')}
            onPress={onGoToLogin}
            variant="secondary"
          />
        )}
      </View>
    </View>
  )
}

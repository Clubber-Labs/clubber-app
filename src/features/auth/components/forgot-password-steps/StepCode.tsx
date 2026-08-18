import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { OtpInput } from '@/shared/components/OtpInput'
import { Button } from '@/shared/components/Button'
import { maskEmail } from '@/shared/utils/masks'

type Props = {
  email: string
  code: string
  onChangeCode: (value: string) => void
  onProceed: () => void
  onBack: () => void
  onResend: () => void
  resendIn: number
  isResending: boolean
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function StepCode({
  email,
  code,
  onChangeCode,
  onProceed,
  onBack,
  onResend,
  resendIn,
  isResending,
}: Props) {
  const canProceed = code.length === 6
  const { t } = useTranslation()

  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-content">
          {t('auth.forgotPassword.code.title')}
        </Text>
        <Text className="text-sm text-content-muted">
          {t('auth.forgotPassword.code.sentTo', { email: maskEmail(email) })}
        </Text>
      </View>

      <OtpInput
        value={code}
        onChangeText={onChangeCode}
        onComplete={onProceed}
        autoFocus
      />

      <View className="flex-row justify-center">
        {isResending ? (
          <Text className="text-content-subtle text-sm">
            {t('auth.forgotPassword.code.resending')}
          </Text>
        ) : resendIn > 0 ? (
          <Text className="text-content-subtle text-sm">
            {t('auth.forgotPassword.code.resendIn', {
              time: formatCountdown(resendIn),
            })}
          </Text>
        ) : (
          <Pressable onPress={onResend} accessibilityRole="button">
            <Text className="text-brand-text font-semibold text-sm">
              {t('auth.forgotPassword.code.resend')}
            </Text>
          </Pressable>
        )}
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button
            label={t('common.back')}
            onPress={onBack}
            variant="secondary"
          />
        </View>
        <View className="flex-1">
          <Button
            label={t('common.continue')}
            onPress={onProceed}
            disabled={!canProceed}
          />
        </View>
      </View>
    </View>
  )
}

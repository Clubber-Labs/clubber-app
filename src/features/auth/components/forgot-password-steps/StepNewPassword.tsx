import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useForm, Controller, type Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from '../../schemas/forgotPasswordSchema'
import { Button } from '@/shared/components/Button'
import { FormSubmitButton } from '@/shared/components/FormSubmitButton'
import { FormError } from '@/shared/components/FormError'
import { useFormFocus } from '@/shared/lib/formFocus'
import { PasswordInput } from '@/shared/components/PasswordInput'
import { PasswordStrengthMeter } from '@/shared/components/PasswordStrengthMeter'

// Identidade estável: o useWatch do FormSubmitButton tem `name` nas deps do
import {
  useFormErrorBanner,
  messagesFromErrors,
} from '@/shared/hooks/useFormErrorBanner'
// efeito de subscrição, e um literal inline re-assinaria a cada tecla digitada.
const REQUIRED_FIELDS: Path<ResetPasswordInput>[] = [
  'newPassword',
  'confirmPassword',
]

type Props = {
  email: string
  code: string
  onSubmit: (data: ResetPasswordInput) => void
  onBack: () => void
  isSubmitting: boolean
  resetError: string | null
  showResendHint: boolean
}

// email e code vêm das etapas anteriores (já validados) como defaultValues
// ocultos; só os campos de senha são renderizados, mas o schema valida o objeto
// inteiro antes do reset.
export function StepNewPassword({
  email,
  code,
  onSubmit,
  onBack,
  isSubmitting,
  resetError,
  showResendHint,
}: Props) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
    defaultValues: { email, code, newPassword: '', confirmPassword: '' },
  })

  const newPassword = watch('newPassword') ?? ''
  const { t } = useTranslation()
  const form = useFormFocus()
  const showFormErrors = useFormErrorBanner(form)

  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-content">
          {t('auth.forgotPassword.newPassword.title')}
        </Text>
        <Text className="text-sm text-content-muted">
          {t('auth.forgotPassword.newPassword.subtitle')}
        </Text>
      </View>

      <View className="gap-4">
        <View className="gap-2" {...form.anchor('newPassword')}>
          <Text className="text-sm font-medium text-content-tertiary">
            {t('auth.forgotPassword.newPassword.label')}
          </Text>
          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, value } }) => (
              <PasswordInput
                {...form.input('newPassword')}
                value={value}
                onChangeText={onChange}
                placeholder={t('auth.fields.passwordPlaceholder')}
                error={!!errors.newPassword}
                textContentType="newPassword"
                autoComplete="password-new"
                autoFocus
              />
            )}
          />
          <PasswordStrengthMeter password={newPassword} email={email} />
        </View>

        <View className="gap-1" {...form.anchor('confirmPassword')}>
          <Text className="text-sm font-medium text-content-tertiary">
            {t('auth.fields.confirmPassword')}
          </Text>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <PasswordInput
                {...form.input('confirmPassword')}
                value={value}
                onChangeText={onChange}
                placeholder={t('auth.fields.confirmPasswordPlaceholder')}
                error={!!errors.confirmPassword}
                textContentType="newPassword"
                autoComplete="password-new"
              />
            )}
          />
        </View>
      </View>

      <FormError message={resetError} />

      {showResendHint && (
        <Text className="text-content-muted text-xs text-center">
          {t('auth.forgotPassword.newPassword.resendHint')}
        </Text>
      )}

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button
            label={t('common.back')}
            onPress={onBack}
            variant="secondary"
          />
        </View>
        <View className="flex-1">
          <FormSubmitButton
            control={control}
            required={REQUIRED_FIELDS}
            label={
              isSubmitting
                ? t('auth.forgotPassword.newPassword.resetting')
                : t('auth.forgotPassword.newPassword.reset')
            }
            onPress={handleSubmit(onSubmit, errors =>
              showFormErrors(messagesFromErrors(errors)),
            )}
            loading={isSubmitting}
          />
        </View>
      </View>
    </View>
  )
}

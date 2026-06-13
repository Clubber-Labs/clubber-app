import { View, Text } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from '../../schemas/forgotPasswordSchema'
import { Button } from '@/shared/components/Button'
import { FormError } from '@/shared/components/FormError'
import { PasswordInput } from '@/shared/components/PasswordInput'
import { PasswordStrengthMeter } from '@/shared/components/PasswordStrengthMeter'

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

  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-content">
          Criar nova senha
        </Text>
        <Text className="text-sm text-content-muted">
          Use 8+ caracteres com letras e números.
        </Text>
      </View>

      <View className="gap-4">
        <View className="gap-2">
          <Text className="text-sm font-medium text-content-tertiary">
            Nova senha
          </Text>
          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, value } }) => (
              <PasswordInput
                value={value}
                onChangeText={onChange}
                placeholder="Mínimo 8 caracteres"
                error={!!errors.newPassword}
                textContentType="newPassword"
                autoComplete="password-new"
                autoFocus
              />
            )}
          />
          {errors.newPassword && (
            <Text className="text-content text-xs">
              {errors.newPassword.message}
            </Text>
          )}
          <PasswordStrengthMeter password={newPassword} email={email} />
        </View>

        <View className="gap-1">
          <Text className="text-sm font-medium text-content-tertiary">
            Confirmar senha
          </Text>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <PasswordInput
                value={value}
                onChangeText={onChange}
                placeholder="Repita a senha"
                error={!!errors.confirmPassword}
                textContentType="newPassword"
                autoComplete="password-new"
              />
            )}
          />
          {errors.confirmPassword && (
            <Text className="text-content text-xs">
              {errors.confirmPassword.message}
            </Text>
          )}
        </View>
      </View>

      <FormError message={resetError} />

      {showResendHint && (
        <Text className="text-content-muted text-xs text-center">
          Toque em “Voltar” para pedir um novo código.
        </Text>
      )}

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button label="Voltar" onPress={onBack} variant="secondary" />
        </View>
        <View className="flex-1">
          <Button
            label={isSubmitting ? 'Redefinindo...' : 'Redefinir senha'}
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
          />
        </View>
      </View>
    </View>
  )
}

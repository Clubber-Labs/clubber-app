import { View, Text, TextInput } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  forgotPasswordEmailSchema,
  type ForgotPasswordEmailInput,
} from '../../schemas/forgotPasswordSchema'
import { Button } from '@/shared/components/Button'
import { FormError } from '@/shared/components/FormError'
import { colors } from '@/shared/theme'

type Props = {
  defaultEmail?: string
  onSubmit: (email: string) => void
  isSubmitting: boolean
  serverError: string | null
}

export function StepEmail({
  defaultEmail,
  onSubmit,
  isSubmitting,
  serverError,
}: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordEmailInput>({
    resolver: zodResolver(forgotPasswordEmailSchema),
    defaultValues: { email: defaultEmail ?? '' },
  })

  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-content">Recuperar senha</Text>
        <Text className="text-sm text-content-muted">
          Informe o e-mail da sua conta e enviaremos um código.
        </Text>
      </View>

      <View className="gap-1">
        <Text className="text-sm font-medium text-content-tertiary">
          E-mail
        </Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className={`border ${errors.email ? 'border-content' : 'border-line'} bg-surface rounded-xl px-4 py-3.5 text-base text-content`}
              placeholder="joao@email.com"
              placeholderTextColor={colors.contentSubtle}
              onChangeText={onChange}
              value={value}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              accessibilityLabel="E-mail da conta"
            />
          )}
        />
        {errors.email && (
          <Text className="text-content text-xs">{errors.email.message}</Text>
        )}
      </View>

      <FormError message={serverError} />

      <Button
        label={isSubmitting ? 'Enviando...' : 'Enviar código'}
        onPress={handleSubmit(data => onSubmit(data.email))}
        loading={isSubmitting}
      />
    </View>
  )
}

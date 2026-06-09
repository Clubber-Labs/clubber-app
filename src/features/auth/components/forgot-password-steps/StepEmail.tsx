import { View, Text, TextInput } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  forgotPasswordEmailSchema,
  type ForgotPasswordEmailInput,
} from '../../schemas/forgotPasswordSchema'
import { Button } from '@/shared/components/Button'
import { FormError } from '@/shared/components/FormError'

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
        <Text className="text-2xl font-bold text-white">Recuperar senha</Text>
        <Text className="text-sm text-zinc-400">
          Informe o e-mail da sua conta e enviaremos um código.
        </Text>
      </View>

      <View className="gap-1">
        <Text className="text-sm font-medium text-zinc-300">E-mail</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className={`border ${errors.email ? 'border-white' : 'border-zinc-800'} bg-zinc-900 rounded-xl px-4 py-3.5 text-base text-white`}
              placeholder="joao@email.com"
              placeholderTextColor="#71717a"
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
          <Text className="text-white text-xs">{errors.email.message}</Text>
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

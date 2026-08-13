import { View, Text, TextInput } from 'react-native'
import { Link } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '../schemas/loginSchema'
import { useLogin } from '../hooks/useLogin'
import { FormSubmitButton } from '@/shared/components/FormSubmitButton'
import { FormError } from '@/shared/components/FormError'
import { useFormFocus } from '@/shared/lib/formFocus'
import { isUnauthorizedError } from '@/shared/lib/apiError'
import { colors } from '@/shared/theme'

type Props = {
  defaultEmail?: string
}

export function LoginForm({ defaultEmail }: Props) {
  const { mutate: login, isPending, error } = useLogin()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: defaultEmail ?? '' },
  })
  const form = useFormFocus()

  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            {...form.input('email')}
            className={`border ${errors.email ? 'border-content' : 'border-line'} bg-surface rounded-full px-4 py-3.5 text-base text-content`}
            placeholder="E-mail"
            placeholderTextColor={colors.contentSubtle}
            onChangeText={onChange}
            value={value}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        )}
      />
      {errors.email && (
        <Text className="text-content text-sm">{errors.email.message}</Text>
      )}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            {...form.input('password')}
            className={`border ${errors.password ? 'border-content' : 'border-line'} bg-surface rounded-full px-4 py-3.5 text-base text-content`}
            placeholder="Senha"
            placeholderTextColor={colors.contentSubtle}
            onChangeText={onChange}
            value={value}
            secureTextEntry
          />
        )}
      />
      {errors.password && (
        <Text className="text-content text-sm">{errors.password.message}</Text>
      )}

      <View className="flex-row justify-end">
        <Link href="/(auth)/forgot-password">
          <Text className="text-brand-text text-sm font-medium">
            Esqueci minha senha
          </Text>
        </Link>
      </View>

      <FormError
        message={
          error
            ? isUnauthorizedError(error)
              ? 'E-mail ou senha incorretos.'
              : 'Não foi possível entrar. Tente novamente.'
            : null
        }
      />

      <FormSubmitButton
        control={control}
        required={['email', 'password']}
        label={isPending ? 'Entrando...' : 'Entrar'}
        onPress={handleSubmit(data => login(data), form.focusFirstError)}
        loading={isPending}
      />
    </View>
  )
}

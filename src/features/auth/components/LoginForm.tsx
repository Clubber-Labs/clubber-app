import { View, Text, TextInput } from 'react-native'
import { Link } from 'expo-router'
import { useForm, Controller, type Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '../schemas/loginSchema'
import { useLogin } from '../hooks/useLogin'
import { FormSubmitButton } from '@/shared/components/FormSubmitButton'
import { FormError } from '@/shared/components/FormError'
import { useFormFocus } from '@/shared/lib/formFocus'
import { isUnauthorizedError } from '@/shared/lib/apiError'
import { colors } from '@/shared/theme'
import {
  useFormErrorBanner,
  messagesFromErrors,
} from '@/shared/hooks/useFormErrorBanner'

// Identidade estável: o useWatch do FormSubmitButton tem `name` nas deps do
// efeito de subscrição, e um literal inline re-assinaria a cada tecla digitada.
const REQUIRED_FIELDS: Path<LoginInput>[] = ['identifier', 'password']

type Props = {
  /** Pré-preenche o campo — o cadastro manda o e-mail recém-criado. */
  defaultIdentifier?: string
}

export function LoginForm({ defaultIdentifier }: Props) {
  const { mutate: login, isPending, error } = useLogin()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: defaultIdentifier ?? '' },
  })
  const form = useFormFocus()
  const showFormErrors = useFormErrorBanner(form)

  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="identifier"
        render={({ field: { onChange, value } }) => (
          <TextInput
            {...form.input('identifier')}
            className={`border ${errors.identifier ? 'border-content' : 'border-line'} bg-surface rounded-full px-4 py-3.5 text-base text-content`}
            placeholder="E-mail ou nome de usuário"
            placeholderTextColor={colors.contentSubtle}
            onChangeText={onChange}
            value={value}
            autoCapitalize="none"
            autoCorrect={false}
          />
        )}
      />

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
              ? 'E-mail, nome de usuário ou senha incorretos.'
              : 'Não foi possível entrar. Tente novamente.'
            : null
        }
      />

      <FormSubmitButton
        control={control}
        required={REQUIRED_FIELDS}
        label={isPending ? 'Entrando...' : 'Entrar'}
        onPress={handleSubmit(
          data => login(data),
          errors => showFormErrors(messagesFromErrors(errors)),
        )}
        loading={isPending}
      />
    </View>
  )
}

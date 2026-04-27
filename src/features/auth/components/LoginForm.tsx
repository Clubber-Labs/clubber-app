import { View, Text, TextInput } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '../schemas/loginSchema'
import { useLogin } from '../hooks/useLogin'
import { Button } from '@/shared/components/Button'

export function LoginForm() {
  const { mutate: login, isPending } = useLogin()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            className={`border ${errors.email ? 'border-red-400' : 'border-zinc-800'} bg-zinc-900 rounded-xl px-4 py-3.5 text-base text-white`}
            placeholder="E-mail"
            placeholderTextColor="#71717a"
            onChangeText={onChange}
            value={value}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        )}
      />
      {errors.email && (
        <Text className="text-red-500 text-sm">{errors.email.message}</Text>
      )}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            className={`border ${errors.password ? 'border-red-400' : 'border-zinc-800'} bg-zinc-900 rounded-xl px-4 py-3.5 text-base text-white`}
            placeholder="Senha"
            placeholderTextColor="#71717a"
            onChangeText={onChange}
            value={value}
            secureTextEntry
          />
        )}
      />
      {errors.password && (
        <Text className="text-red-500 text-sm">{errors.password.message}</Text>
      )}

      <Button
        label={isPending ? 'Entrando...' : 'Entrar'}
        onPress={handleSubmit(data => login(data))}
        loading={isPending}
      />
    </View>
  )
}

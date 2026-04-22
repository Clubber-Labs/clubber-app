import { View, Text, TextInput } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '../schemas/registerSchema'
import { useRegister } from '../hooks/useRegister'
import { Button } from '@/shared/components/Button'

export function RegisterForm() {
  const { mutate: register, isPending } = useRegister()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
            placeholder="Nome"
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.name && (
        <Text className="text-red-500 text-sm">{errors.name.message}</Text>
      )}

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
            placeholder="E-mail"
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
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
            placeholder="Senha"
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
        label={isPending ? 'Cadastrando...' : 'Cadastrar'}
        onPress={handleSubmit(data => register(data))}
        loading={isPending}
      />
    </View>
  )
}

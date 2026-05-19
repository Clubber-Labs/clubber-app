import { View, Text, TextInput } from 'react-native'
import { Controller } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'
import type { RegisterInput } from '../../schemas/registerSchema'

type Props = {
  control: Control<RegisterInput>
  errors: FieldErrors<RegisterInput>
}

export function StepPassword({ control, errors }: Props) {
  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-white">Crie sua senha</Text>
        <Text className="text-sm text-zinc-400">
          Use pelo menos 8 caracteres.
        </Text>
      </View>

      <View className="gap-4">
        <View className="gap-1">
          <Text className="text-sm font-medium text-zinc-300">Senha</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className={`border ${errors.password ? 'border-white' : 'border-zinc-800'} bg-zinc-900 rounded-xl px-4 py-3.5 text-base text-white`}
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor="#71717a"
                onChangeText={onChange}
                value={value}
                secureTextEntry
              />
            )}
          />
          {errors.password && (
            <Text className="text-white text-xs">
              {errors.password.message}
            </Text>
          )}
        </View>

        <View className="gap-1">
          <Text className="text-sm font-medium text-zinc-300">
            Confirmar senha
          </Text>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className={`border ${errors.confirmPassword ? 'border-white' : 'border-zinc-800'} bg-zinc-900 rounded-xl px-4 py-3.5 text-base text-white`}
                placeholder="Repita a senha"
                placeholderTextColor="#71717a"
                onChangeText={onChange}
                value={value}
                secureTextEntry
              />
            )}
          />
          {errors.confirmPassword && (
            <Text className="text-white text-xs">
              {errors.confirmPassword.message}
            </Text>
          )}
        </View>
      </View>
    </View>
  )
}

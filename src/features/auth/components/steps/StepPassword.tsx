import { View, Text, TextInput } from 'react-native'
import { Controller } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'
import type { RegisterInput } from '../../schemas/registerSchema'
import { colors } from '@/shared/theme'

type Props = {
  control: Control<RegisterInput>
  errors: FieldErrors<RegisterInput>
}

export function StepPassword({ control, errors }: Props) {
  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-content">Crie sua senha</Text>
        <Text className="text-sm text-content-muted">
          Use pelo menos 8 caracteres.
        </Text>
      </View>

      <View className="gap-4">
        <View className="gap-1">
          <Text className="text-sm font-medium text-content-tertiary">
            Senha
          </Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className={`border ${errors.password ? 'border-content' : 'border-line'} bg-surface rounded-xl px-4 py-3.5 text-base text-content`}
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor={colors.contentSubtle}
                onChangeText={onChange}
                value={value}
                secureTextEntry
              />
            )}
          />
          {errors.password && (
            <Text className="text-content text-xs">
              {errors.password.message}
            </Text>
          )}
        </View>

        <View className="gap-1">
          <Text className="text-sm font-medium text-content-tertiary">
            Confirmar senha
          </Text>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className={`border ${errors.confirmPassword ? 'border-content' : 'border-line'} bg-surface rounded-xl px-4 py-3.5 text-base text-content`}
                placeholder="Repita a senha"
                placeholderTextColor={colors.contentSubtle}
                onChangeText={onChange}
                value={value}
                secureTextEntry
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
    </View>
  )
}

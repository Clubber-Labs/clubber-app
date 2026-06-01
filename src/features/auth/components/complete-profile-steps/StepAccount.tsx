import { View, Text, TextInput } from 'react-native'
import { Controller } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'
import { formatPhone } from '@/shared/utils/masks'
import type { CompleteProfileInput } from '../../schemas/completeProfileSchema'

type Props = {
  control: Control<CompleteProfileInput>
  errors: FieldErrors<CompleteProfileInput>
  email?: string
}

export function StepAccount({ control, errors, email }: Props) {
  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-white">Sua conta</Text>
        <Text className="text-sm text-zinc-400">
          Escolha como as pessoas vão te encontrar.
        </Text>
      </View>

      <View className="gap-4">
        {!!email && (
          <View className="gap-1">
            <Text className="text-sm font-medium text-zinc-300">E-mail</Text>
            <View className="border border-zinc-800 bg-zinc-900 rounded-xl px-4 py-3.5 opacity-70">
              <Text className="text-base text-zinc-300">{email}</Text>
            </View>
          </View>
        )}

        <View className="gap-1">
          <Text className="text-sm font-medium text-zinc-300">
            Nome de usuário
          </Text>
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                className={`border ${errors.username ? 'border-white' : 'border-zinc-800'} bg-zinc-900 rounded-xl px-4 py-3.5 text-base text-white`}
                placeholder="joaosilva"
                placeholderTextColor="#71717a"
                autoCapitalize="none"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
              />
            )}
          />
          {errors.username && (
            <Text className="text-white text-xs">
              {errors.username.message}
            </Text>
          )}
        </View>

        <View className="gap-1">
          <Text className="text-sm font-medium text-zinc-300">Telefone</Text>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                className={`border ${errors.phone ? 'border-white' : 'border-zinc-800'} bg-zinc-900 rounded-xl px-4 py-3.5 text-base text-white`}
                placeholder="(11) 99999-9999"
                placeholderTextColor="#71717a"
                keyboardType="phone-pad"
                onChangeText={text => onChange(text.replace(/\D/g, ''))}
                onBlur={onBlur}
                value={formatPhone(value ?? '')}
              />
            )}
          />
          {errors.phone && (
            <Text className="text-white text-xs">{errors.phone.message}</Text>
          )}
        </View>
      </View>
    </View>
  )
}

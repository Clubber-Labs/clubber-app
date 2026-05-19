import { View, Text, TextInput } from 'react-native'
import { Controller } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'
import type { RegisterInput } from '../../schemas/registerSchema'
import { formatPhone } from '@/shared/utils/masks'

type Props = {
  control: Control<RegisterInput>
  errors: FieldErrors<RegisterInput>
}

export function StepAccount({ control, errors }: Props) {
  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-white">Sua conta</Text>
        <Text className="text-sm text-zinc-400">
          Esses dados são usados para acessar o ConnectAI.
        </Text>
      </View>

      <View className="gap-4">
        <View className="gap-1">
          <Text className="text-sm font-medium text-zinc-300">Username</Text>
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className={`border ${errors.username ? 'border-white' : 'border-zinc-800'} bg-zinc-900 rounded-xl px-4 py-3.5 text-base text-white`}
                placeholder="joaosilva"
                placeholderTextColor="#71717a"
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
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
                keyboardType="email-address"
              />
            )}
          />
          {errors.email && (
            <Text className="text-white text-xs">{errors.email.message}</Text>
          )}
        </View>

        <View className="gap-1">
          <Text className="text-sm font-medium text-zinc-300">Telefone</Text>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className={`border ${errors.phone ? 'border-white' : 'border-zinc-800'} bg-zinc-900 rounded-xl px-4 py-3.5 text-base text-white`}
                placeholder="(11) 99999-9999"
                placeholderTextColor="#71717a"
                onChangeText={text => onChange(text.replace(/\D/g, ''))}
                value={formatPhone(value ?? '')}
                keyboardType="phone-pad"
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

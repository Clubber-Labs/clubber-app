import { View, Text, TextInput } from 'react-native'
import { Controller } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'
import { formatPhone } from '@/shared/utils/masks'
import type { CompleteProfileInput } from '../../schemas/completeProfileSchema'
import { colors } from '@/shared/theme'

type Props = {
  control: Control<CompleteProfileInput>
  errors: FieldErrors<CompleteProfileInput>
  email?: string
}

export function StepAccount({ control, errors, email }: Props) {
  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-content">Sua conta</Text>
        <Text className="text-sm text-content-muted">
          Escolha como as pessoas vão te encontrar.
        </Text>
      </View>

      <View className="gap-4">
        {!!email && (
          <View className="gap-1">
            <Text className="text-sm font-medium text-content-tertiary">
              E-mail
            </Text>
            <View className="border border-line bg-surface rounded-xl px-4 py-3.5 opacity-70">
              <Text className="text-base text-content-tertiary">{email}</Text>
            </View>
          </View>
        )}

        <View className="gap-1">
          <Text className="text-sm font-medium text-content-tertiary">
            Nome de usuário
          </Text>
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                className={`border ${errors.username ? 'border-content' : 'border-line'} bg-surface rounded-xl px-4 py-3.5 text-base text-content`}
                placeholder="joaosilva"
                placeholderTextColor={colors.contentSubtle}
                autoCapitalize="none"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
              />
            )}
          />
          {errors.username && (
            <Text className="text-content text-xs">
              {errors.username.message}
            </Text>
          )}
        </View>

        <View className="gap-1">
          <Text className="text-sm font-medium text-content-tertiary">
            Telefone
          </Text>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                className={`border ${errors.phone ? 'border-content' : 'border-line'} bg-surface rounded-xl px-4 py-3.5 text-base text-content`}
                placeholder="(11) 99999-9999"
                placeholderTextColor={colors.contentSubtle}
                keyboardType="phone-pad"
                onChangeText={text => onChange(text.replace(/\D/g, ''))}
                onBlur={onBlur}
                value={formatPhone(value ?? '')}
              />
            )}
          />
          {errors.phone && (
            <Text className="text-content text-xs">{errors.phone.message}</Text>
          )}
        </View>
      </View>
    </View>
  )
}

import { View, Text, TextInput } from 'react-native'
import { Controller, useWatch } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'
import type { RegisterInput } from '../../schemas/registerSchema'
import {
  useUsernameAvailability,
  type UsernameAvailability,
} from '@/features/users/hooks/useUsernameAvailability'
import { formatPhone } from '@/shared/utils/masks'
import { useFormFocus } from '@/shared/lib/formFocus'
import { colors } from '@/shared/theme'

type Props = {
  control: Control<RegisterInput>
  errors: FieldErrors<RegisterInput>
}

const AVAILABILITY_TEXT: Record<
  Exclude<UsernameAvailability, 'idle'>,
  { label: string; className: string }
> = {
  checking: {
    label: 'Verificando disponibilidade...',
    className: 'text-content-subtle',
  },
  available: { label: 'Disponível', className: 'text-success-text' },
  taken: {
    label: 'Este nome de usuário já está em uso.',
    className: 'text-content',
  },
}

export function StepAccount({ control, errors }: Props) {
  const form = useFormFocus()
  // O watch mora nesta etapa, e não no RegisterForm, pra digitar no username
  // re-renderizar só aqui — mesma razão do FormSubmitButton assinar apenas os
  // campos obrigatórios em vez de o formulário inteiro.
  const username = useWatch({ control, name: 'username' }) ?? ''
  const availability = useUsernameAvailability(username)
  // Erro de formato do Zod tem precedência: o campo nunca mostra dois estados.
  const showAvailability = !errors.username && availability !== 'idle'
  const usernameFlagged = !!errors.username || availability === 'taken'

  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-content">Sua conta</Text>
        <Text className="text-sm text-content-muted">
          Esses dados são usados para acessar o Clubber.
        </Text>
      </View>

      <View className="gap-4">
        <View className="gap-1" {...form.anchor('username')}>
          <Text className="text-sm font-medium text-content-tertiary">
            Username
          </Text>
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value } }) => (
              <TextInput
                {...form.input('username')}
                className={`border ${usernameFlagged ? 'border-content' : 'border-line'} bg-surface rounded-full px-4 py-3.5 text-base text-content`}
                placeholder="joaosilva"
                placeholderTextColor={colors.contentSubtle}
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
              />
            )}
          />
          {errors.username && (
            <Text className="text-content text-xs">
              {errors.username.message}
            </Text>
          )}
          {showAvailability && (
            <Text
              className={`text-xs ${AVAILABILITY_TEXT[availability].className}`}
            >
              {AVAILABILITY_TEXT[availability].label}
            </Text>
          )}
        </View>

        <View className="gap-1" {...form.anchor('email')}>
          <Text className="text-sm font-medium text-content-tertiary">
            E-mail
          </Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput
                {...form.input('email')}
                className={`border ${errors.email ? 'border-content' : 'border-line'} bg-surface rounded-full px-4 py-3.5 text-base text-content`}
                placeholder="joao@email.com"
                placeholderTextColor={colors.contentSubtle}
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            )}
          />
          {errors.email && (
            <Text className="text-content text-xs">{errors.email.message}</Text>
          )}
        </View>

        <View className="gap-1" {...form.anchor('phone')}>
          <Text className="text-sm font-medium text-content-tertiary">
            Telefone
          </Text>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <TextInput
                {...form.input('phone')}
                className={`border ${errors.phone ? 'border-content' : 'border-line'} bg-surface rounded-full px-4 py-3.5 text-base text-content`}
                placeholder="(11) 99999-9999"
                placeholderTextColor={colors.contentSubtle}
                onChangeText={text => onChange(text.replace(/\D/g, ''))}
                value={formatPhone(value ?? '')}
                keyboardType="phone-pad"
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

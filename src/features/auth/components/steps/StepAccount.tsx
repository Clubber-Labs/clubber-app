import { View, Text, TextInput } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Controller, useWatch } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'
import type { RegisterInput } from '../../schemas/registerSchema'
import {
  useUsernameAvailability,
  type UsernameAvailability,
} from '@/features/users/hooks/useUsernameAvailability'
import { formatPhone, phoneDigits } from '@/shared/utils/masks'
import { sanitizeUsername } from '@/shared/utils/username'
import { useFormFocus } from '@/shared/lib/formFocus'
import { colors } from '@/shared/theme'

type Props = {
  control: Control<RegisterInput>
  errors: FieldErrors<RegisterInput>
}

// A label é CHAVE (traduzida no render): frase pronta aqui congelaria o idioma
// no import do módulo — mesma armadilha dos schemas Zod.
const AVAILABILITY_TEXT: Record<
  Exclude<UsernameAvailability, 'idle'>,
  {
    label:
      | 'auth.register.account.checking'
      | 'auth.register.account.available'
      | 'errors.USERNAME_TAKEN'
    className: string
  }
> = {
  checking: {
    label: 'auth.register.account.checking',
    className: 'text-content-subtle',
  },
  available: {
    label: 'auth.register.account.available',
    className: 'text-success-text',
  },
  taken: { label: 'errors.USERNAME_TAKEN', className: 'text-content' },
}

export function StepAccount({ control, errors }: Props) {
  const { t } = useTranslation()
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
        <Text className="text-2xl font-bold text-content">
          {t('auth.register.account.title')}
        </Text>
        <Text className="text-sm text-content-muted">
          {t('auth.register.account.subtitle')}
        </Text>
      </View>

      <View className="gap-4">
        <View className="gap-1" {...form.anchor('username')}>
          <Text className="text-sm font-medium text-content-tertiary">
            {t('auth.fields.username')}
          </Text>
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value } }) => (
              <TextInput
                {...form.input('username')}
                className={`border ${usernameFlagged ? 'border-content' : 'border-line'} bg-surface rounded-full px-4 py-3.5 text-base text-content`}
                placeholder={t('auth.fields.usernamePlaceholder')}
                placeholderTextColor={colors.contentSubtle}
                onChangeText={text => onChange(sanitizeUsername(text))}
                value={value}
                autoCapitalize="none"
              />
            )}
          />
          {showAvailability ? (
            <Text
              className={`text-xs ${AVAILABILITY_TEXT[availability].className}`}
            >
              {t(AVAILABILITY_TEXT[availability].label)}
            </Text>
          ) : (
            <Text className="text-xs text-content-subtle">
              {t('auth.fields.usernameHint')}
            </Text>
          )}
        </View>

        <View className="gap-1" {...form.anchor('email')}>
          <Text className="text-sm font-medium text-content-tertiary">
            {t('auth.fields.email')}
          </Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput
                {...form.input('email')}
                className={`border ${errors.email ? 'border-content' : 'border-line'} bg-surface rounded-full px-4 py-3.5 text-base text-content`}
                placeholder={t('auth.fields.emailPlaceholder')}
                placeholderTextColor={colors.contentSubtle}
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            )}
          />
        </View>

        <View className="gap-1" {...form.anchor('phone')}>
          <Text className="text-sm font-medium text-content-tertiary">
            {t('auth.fields.phone')}
          </Text>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <TextInput
                {...form.input('phone')}
                className={`border ${errors.phone ? 'border-content' : 'border-line'} bg-surface rounded-full px-4 py-3.5 text-base text-content`}
                placeholder={t('auth.fields.phonePlaceholder')}
                placeholderTextColor={colors.contentSubtle}
                onChangeText={text => onChange(phoneDigits(text))}
                value={formatPhone(value ?? '')}
                keyboardType="phone-pad"
              />
            )}
          />
        </View>
      </View>
    </View>
  )
}

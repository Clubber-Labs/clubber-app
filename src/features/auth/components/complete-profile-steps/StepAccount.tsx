import { View, Text, TextInput } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Controller } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'
import { formatPhone, phoneDigits } from '@/shared/utils/masks'
import { sanitizeUsername } from '@/shared/utils/username'
import type { CompleteProfileInput } from '../../schemas/completeProfileSchema'
import { useFormFocus } from '@/shared/lib/formFocus'
import { colors } from '@/shared/theme'

type Props = {
  control: Control<CompleteProfileInput>
  errors: FieldErrors<CompleteProfileInput>
  email?: string
}

export function StepAccount({ control, errors, email }: Props) {
  const form = useFormFocus()
  const { t } = useTranslation()

  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-content">
          {t('auth.register.account.title')}
        </Text>
        <Text className="text-sm text-content-muted">
          {t('auth.completeProfile.account.subtitle')}
        </Text>
      </View>

      <View className="gap-4">
        {!!email && (
          <View className="gap-1">
            <Text className="text-sm font-medium text-content-tertiary">
              {t('auth.fields.email')}
            </Text>
            <View className="border border-line bg-surface rounded-full px-4 py-3.5 opacity-70">
              <Text className="text-base text-content-tertiary">{email}</Text>
            </View>
          </View>
        )}

        <View className="gap-1" {...form.anchor('username')}>
          <Text className="text-sm font-medium text-content-tertiary">
            {t('auth.fields.usernameLong')}
          </Text>
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                {...form.input('username')}
                className={`border ${errors.username ? 'border-content' : 'border-line'} bg-surface rounded-full px-4 py-3.5 text-base text-content`}
                placeholder={t('auth.fields.usernamePlaceholder')}
                placeholderTextColor={colors.contentSubtle}
                autoCapitalize="none"
                onChangeText={text => onChange(sanitizeUsername(text))}
                onBlur={onBlur}
                value={value}
              />
            )}
          />
          <Text className="text-xs text-content-subtle">
            {t('auth.fields.usernameHint')}
          </Text>
        </View>

        <View className="gap-1" {...form.anchor('phone')}>
          <Text className="text-sm font-medium text-content-tertiary">
            {t('auth.fields.phone')}
          </Text>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                {...form.input('phone')}
                className={`border ${errors.phone ? 'border-content' : 'border-line'} bg-surface rounded-full px-4 py-3.5 text-base text-content`}
                placeholder={t('auth.fields.phonePlaceholder')}
                placeholderTextColor={colors.contentSubtle}
                keyboardType="phone-pad"
                onChangeText={text => onChange(phoneDigits(text))}
                onBlur={onBlur}
                value={formatPhone(value ?? '')}
              />
            )}
          />
        </View>
      </View>
    </View>
  )
}

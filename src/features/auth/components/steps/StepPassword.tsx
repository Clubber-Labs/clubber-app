import { View, Text, TextInput } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Controller } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'
import type { RegisterInput } from '../../schemas/registerSchema'
import { useFormFocus } from '@/shared/lib/formFocus'
import { colors } from '@/shared/theme'

type Props = {
  control: Control<RegisterInput>
  errors: FieldErrors<RegisterInput>
}

export function StepPassword({ control, errors }: Props) {
  const form = useFormFocus()
  const { t } = useTranslation()

  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-content">
          {t('auth.register.password.title')}
        </Text>
        <Text className="text-sm text-content-muted">
          {t('auth.register.password.subtitle')}
        </Text>
      </View>

      <View className="gap-4">
        <View className="gap-1" {...form.anchor('password')}>
          <Text className="text-sm font-medium text-content-tertiary">
            {t('auth.fields.password')}
          </Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextInput
                {...form.input('password')}
                className={`border ${errors.password ? 'border-content' : 'border-line'} bg-surface rounded-xl px-4 py-3.5 text-base text-content`}
                placeholder={t('auth.fields.passwordPlaceholder')}
                placeholderTextColor={colors.contentSubtle}
                onChangeText={onChange}
                value={value}
                secureTextEntry
              />
            )}
          />
        </View>

        <View className="gap-1" {...form.anchor('confirmPassword')}>
          <Text className="text-sm font-medium text-content-tertiary">
            {t('auth.fields.confirmPassword')}
          </Text>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <TextInput
                {...form.input('confirmPassword')}
                className={`border ${errors.confirmPassword ? 'border-content' : 'border-line'} bg-surface rounded-xl px-4 py-3.5 text-base text-content`}
                placeholder={t('auth.fields.confirmPasswordPlaceholder')}
                placeholderTextColor={colors.contentSubtle}
                onChangeText={onChange}
                value={value}
                secureTextEntry
              />
            )}
          />
        </View>
      </View>
    </View>
  )
}

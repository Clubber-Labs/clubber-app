import { View, Text, TextInput } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Controller } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'
import { DatePicker } from '@/shared/components/DatePicker'
import type { CompleteProfileInput } from '../../schemas/completeProfileSchema'
import { sanitizeName } from '@/shared/utils/name'
import { useFormFocus } from '@/shared/lib/formFocus'
import { colors } from '@/shared/theme'

type Props = {
  control: Control<CompleteProfileInput>
  errors: FieldErrors<CompleteProfileInput>
}

export function StepIdentity({ control, errors }: Props) {
  const form = useFormFocus()
  const { t } = useTranslation()

  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-content">
          {t('auth.completeProfile.identity.title')}
        </Text>
        <Text className="text-sm text-content-muted">
          {t('auth.completeProfile.identity.subtitle')}
        </Text>
      </View>

      <View className="gap-4">
        <View className="flex-row gap-3">
          <View className="flex-1 gap-1" {...form.anchor('name')}>
            <Text className="text-sm font-medium text-content-tertiary">
              {t('auth.fields.name')}
            </Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  {...form.input('name')}
                  className={`border ${errors.name ? 'border-content' : 'border-line'} bg-surface rounded-xl px-4 py-3.5 text-base text-content`}
                  placeholder={t('auth.fields.namePlaceholder')}
                  placeholderTextColor={colors.contentSubtle}
                  autoCapitalize="words"
                  onChangeText={text => onChange(sanitizeName(text))}
                  onBlur={onBlur}
                  value={value}
                />
              )}
            />
          </View>

          <View className="flex-1 gap-1" {...form.anchor('lastname')}>
            <Text className="text-sm font-medium text-content-tertiary">
              {t('auth.fields.lastname')}
            </Text>
            <Controller
              control={control}
              name="lastname"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  {...form.input('lastname')}
                  className={`border ${errors.lastname ? 'border-content' : 'border-line'} bg-surface rounded-xl px-4 py-3.5 text-base text-content`}
                  placeholder={t('auth.fields.lastnamePlaceholder')}
                  placeholderTextColor={colors.contentSubtle}
                  autoCapitalize="words"
                  onChangeText={text => onChange(sanitizeName(text))}
                  onBlur={onBlur}
                  value={value}
                />
              )}
            />
          </View>
        </View>

        <View className="gap-1" {...form.anchor('birthdate')}>
          <Text className="text-sm font-medium text-content-tertiary">
            {t('auth.fields.birthdate')}
          </Text>
          <Controller
            control={control}
            name="birthdate"
            render={({ field: { onChange, value } }) => (
              <DatePicker
                value={value}
                onChange={onChange}
                placeholder={t('auth.fields.birthdatePlaceholder')}
                maximumDate={new Date()}
                hasError={!!errors.birthdate}
              />
            )}
          />
        </View>
      </View>
    </View>
  )
}

import { View, Text, TextInput } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Controller } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'
import type { RegisterInput } from '../../schemas/registerSchema'
import { DatePicker } from '@/shared/components/DatePicker'
import { useFormFocus } from '@/shared/lib/formFocus'
import { colors } from '@/shared/theme'

type Props = {
  control: Control<RegisterInput>
  errors: FieldErrors<RegisterInput>
}

export function StepPersonal({ control, errors }: Props) {
  const form = useFormFocus()
  const { t } = useTranslation()
  const maxBirthdate = new Date()
  maxBirthdate.setFullYear(maxBirthdate.getFullYear() - 16)

  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-content">
          {t('auth.register.personal.title')}
        </Text>
        <Text className="text-sm text-content-muted">
          {t('auth.register.personal.subtitle')}
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
              render={({ field: { onChange, value } }) => (
                <TextInput
                  {...form.input('name')}
                  className={`border ${errors.name ? 'border-content' : 'border-line'} bg-surface rounded-xl px-4 py-3.5 text-base text-content`}
                  placeholder={t('auth.fields.namePlaceholder')}
                  placeholderTextColor={colors.contentSubtle}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="words"
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
              render={({ field: { onChange, value } }) => (
                <TextInput
                  {...form.input('lastname')}
                  className={`border ${errors.lastname ? 'border-content' : 'border-line'} bg-surface rounded-xl px-4 py-3.5 text-base text-content`}
                  placeholder={t('auth.fields.lastnamePlaceholder')}
                  placeholderTextColor={colors.contentSubtle}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="words"
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
                maximumDate={maxBirthdate}
                hasError={!!errors.birthdate}
              />
            )}
          />
        </View>
      </View>
    </View>
  )
}

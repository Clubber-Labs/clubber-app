import { View, Text, TextInput, Switch, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Controller } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'
import { SpotifyImportButton } from '@/features/spotify/components/SpotifyImportButton'
import { CategoryMultiSelect } from '@/shared/components/CategoryMultiSelect'
import { InterestsMultiSelect } from '@/shared/components/InterestsMultiSelect'
import type { CompleteProfileInput } from '../../schemas/completeProfileSchema'
import { useFormFocus } from '@/shared/lib/formFocus'
import { colors } from '@/shared/theme'

type Props = {
  control: Control<CompleteProfileInput>
  errors: FieldErrors<CompleteProfileInput>
}

export function StepInterests({ control, errors }: Props) {
  const form = useFormFocus()
  const { t } = useTranslation()

  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-content">
          {t('auth.completeProfile.interests.title')}
        </Text>
        <Text className="text-sm text-content-muted">
          {t('auth.completeProfile.interests.subtitle')}
        </Text>
      </View>

      {/* Acima dos seletores de propósito: o atalho só vale enquanto o
          trabalho manual ainda não foi feito. */}
      <SpotifyImportButton control={control} />

      <View className="gap-5">
        <View className="gap-2" {...form.anchor('preferredCategories')}>
          <Text className="text-sm font-medium text-content-tertiary">
            {t('auth.fields.categories')}
          </Text>
          <Text className="text-xs text-content-subtle">
            {t('auth.completeProfile.interests.categoriesHint')}
          </Text>
          <Controller
            control={control}
            name="preferredCategories"
            render={({ field: { onChange, value } }) => (
              <CategoryMultiSelect value={value ?? []} onChange={onChange} />
            )}
          />

          <Controller
            control={control}
            name="preferredSubcategories"
            render={({ field: { onChange, value } }) => (
              <InterestsMultiSelect value={value ?? []} onChange={onChange} />
            )}
          />
        </View>

        <View className="gap-1" {...form.anchor('bio')}>
          <Text className="text-sm font-medium text-content-tertiary">
            {t('auth.fields.bio')}{' '}
            <Text className="text-content-subtle text-xs">
              {t('auth.fields.bioOptional')}
            </Text>
          </Text>
          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                {...form.input('bio')}
                className={`border ${errors.bio ? 'border-content' : 'border-line'} bg-surface rounded-xl px-4 py-3.5 text-base text-content`}
                placeholder={t('auth.fields.bioPlaceholder')}
                placeholderTextColor={colors.contentSubtle}
                multiline
                numberOfLines={3}
                maxLength={255}
                style={{ minHeight: 80, textAlignVertical: 'top' }}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
              />
            )}
          />
        </View>

        <Controller
          control={control}
          name="isPrivate"
          render={({ field: { onChange, value } }) => (
            <Pressable
              onPress={() => onChange(!value)}
              className="flex-row items-center justify-between bg-surface rounded-xl px-4 py-3.5 border border-line"
            >
              <View className="flex-1 mr-3">
                <Text className="text-content text-base font-medium">
                  {t('auth.fields.privateProfile')}
                </Text>
                <Text className="text-content-muted text-xs mt-0.5">
                  {t('auth.completeProfile.interests.privateHint')}
                </Text>
              </View>
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: colors.lineStrong, true: colors.brand }}
                thumbColor={colors.content}
              />
            </Pressable>
          )}
        />
      </View>
    </View>
  )
}

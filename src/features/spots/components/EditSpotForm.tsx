import { View, Text, TextInput, ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/Button'
import { FormError } from '@/shared/components/FormError'
import { editSpotSchema, type EditSpotInput } from '../schemas/editSpotSchema'
import { useKeyboardAwareForm } from '@/shared/hooks/useKeyboardAwareForm'
import {
  useFormErrorBanner,
  messagesFromErrors,
} from '@/shared/hooks/useFormErrorBanner'
import type { Spot } from '../types'
import { colors } from '@/shared/theme'

type Props = {
  spot: Spot
  onSubmit: (data: EditSpotInput) => void
  submitting: boolean
  submitError: string | null
}

// Só título/descrição são editáveis após publicar (contrato do PATCH).
export function EditSpotForm({
  spot,
  onSubmit,
  submitting,
  submitError,
}: Props) {
  const { t } = useTranslation()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditSpotInput>({
    resolver: zodResolver(editSpotSchema),
    defaultValues: {
      title: spot.title,
      description: spot.description ?? '',
    },
  })

  const form = useKeyboardAwareForm()
  const showFormErrors = useFormErrorBanner(form)

  return (
    <ScrollView
      {...form.scrollProps}
      contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
    >
      <View className="gap-1" {...form.anchor('title')}>
        <Text className="text-sm font-medium text-content-tertiary">
          {t('spots.form.title')}
        </Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <TextInput
              {...form.input('title')}
              className={`border ${errors.title ? 'border-content' : 'border-line'} bg-surface rounded-xl px-4 py-3.5 text-base text-content`}
              placeholderTextColor={colors.contentSubtle}
              value={value}
              onChangeText={onChange}
            />
          )}
        />
      </View>

      <View className="gap-1" {...form.anchor('description')}>
        <Text className="text-sm font-medium text-content-tertiary">
          {t('spots.form.description')}{' '}
          <Text className="text-content-subtle text-xs">
            {t('spots.form.optional')}
          </Text>
        </Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <TextInput
              {...form.input('description')}
              className={`border ${errors.description ? 'border-content' : 'border-line'} bg-surface rounded-xl px-4 py-3.5 text-base text-content min-h-[96px]`}
              placeholder={t('spots.form.descriptionPlaceholder')}
              placeholderTextColor={colors.contentSubtle}
              value={value ?? ''}
              onChangeText={onChange}
              multiline
              textAlignVertical="top"
            />
          )}
        />
      </View>

      <FormError message={submitError} />

      <Button
        label={
          submitting ? t('spots.form.saving') : t('spots.form.saveChanges')
        }
        onPress={handleSubmit(onSubmit, errors =>
          showFormErrors(messagesFromErrors(errors)),
        )}
        loading={submitting}
      />
    </ScrollView>
  )
}

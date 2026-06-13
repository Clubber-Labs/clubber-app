import { View, Text, TextInput, ScrollView } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/Button'
import { FormError } from '@/shared/components/FormError'
import { editSpotSchema, type EditSpotInput } from '../schemas/editSpotSchema'
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

  return (
    <ScrollView
      contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="gap-1">
        <Text className="text-sm font-medium text-content-tertiary">
          Título
        </Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className={`border ${errors.title ? 'border-content' : 'border-line'} bg-surface rounded-xl px-4 py-3.5 text-base text-content`}
              placeholderTextColor={colors.contentSubtle}
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.title && (
          <Text className="text-content text-xs">{errors.title.message}</Text>
        )}
      </View>

      <View className="gap-1">
        <Text className="text-sm font-medium text-content-tertiary">
          Descrição{' '}
          <Text className="text-content-subtle text-xs">(opcional)</Text>
        </Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className={`border ${errors.description ? 'border-content' : 'border-line'} bg-surface rounded-xl px-4 py-3.5 text-base text-content min-h-[96px]`}
              placeholder="Combina os detalhes com a galera..."
              placeholderTextColor={colors.contentSubtle}
              value={value ?? ''}
              onChangeText={onChange}
              multiline
              textAlignVertical="top"
            />
          )}
        />
        {errors.description && (
          <Text className="text-content text-xs">
            {errors.description.message}
          </Text>
        )}
      </View>

      <FormError message={submitError} />

      <Button
        label={submitting ? 'Salvando...' : 'Salvar alterações'}
        onPress={handleSubmit(onSubmit)}
        loading={submitting}
      />
    </ScrollView>
  )
}

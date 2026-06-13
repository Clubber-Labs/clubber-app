import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createEventSchema,
  type CreateEventInput,
} from '../schemas/createEventSchema'
import type { ReactNode } from 'react'
import { Button } from '@/shared/components/Button'
import { FormError } from '@/shared/components/FormError'
import { DatePicker } from '@/shared/components/DatePicker'
import { CategoryMultiSelect } from '@/shared/components/CategoryMultiSelect'
import { LocationPicker } from './LocationPicker'
import { AddressAutocomplete } from './AddressAutocomplete'
import { colors } from '@/shared/theme'

const DEFAULTS: Partial<CreateEventInput> = {
  title: '',
  description: '',
  address: '',
  categories: [],
  isPublic: true,
}

type Props = {
  defaultValues?: Partial<CreateEventInput>
  onSubmit: (data: CreateEventInput) => void
  submitting: boolean
  submitError: boolean
  submitLabel: string
  submittingLabel: string
  errorMessage: string
  imagesSection?: ReactNode
}

export function EventForm({
  defaultValues,
  onSubmit,
  submitting,
  submitError,
  submitLabel,
  submittingLabel,
  errorMessage,
  imagesSection,
}: Props) {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: { ...DEFAULTS, ...defaultValues },
  })

  const startDate = watch('date')

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
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
                placeholder="Festival de música no parque"
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
            Descrição
          </Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className={`border ${errors.description ? 'border-content' : 'border-line'} bg-surface rounded-xl px-4 py-3.5 text-base text-content min-h-[96px]`}
                placeholder="Conte mais sobre o evento..."
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

        <View className="gap-1">
          <Text className="text-sm font-medium text-content-tertiary">
            Data e hora
          </Text>
          <Controller
            control={control}
            name="date"
            render={({ field: { onChange, value } }) => (
              <DatePicker
                value={value}
                onChange={onChange}
                mode="datetime"
                placeholder="Selecione a data e hora"
                minimumDate={new Date()}
                hasError={!!errors.date}
              />
            )}
          />
          {errors.date && (
            <Text className="text-content text-xs">{errors.date.message}</Text>
          )}
        </View>

        <View className="gap-1">
          <Text className="text-sm font-medium text-content-tertiary">
            Horário de término{' '}
            <Text className="text-content-subtle text-xs">(opcional)</Text>
          </Text>
          <Controller
            control={control}
            name="endDate"
            render={({ field: { onChange, value } }) => (
              <DatePicker
                value={value}
                onChange={onChange}
                mode="datetime"
                placeholder="Quando termina"
                minimumDate={startDate ?? new Date()}
                hasError={!!errors.endDate}
              />
            )}
          />
          {errors.endDate && (
            <Text className="text-content text-xs">
              {errors.endDate.message}
            </Text>
          )}
        </View>

        <View className="gap-1">
          <Text className="text-sm font-medium text-content-tertiary">
            Categorias
          </Text>
          <Controller
            control={control}
            name="categories"
            render={({ field: { onChange, value } }) => (
              <CategoryMultiSelect value={value} onChange={onChange} />
            )}
          />
          {errors.categories && (
            <Text className="text-content text-xs">
              {errors.categories.message}
            </Text>
          )}
        </View>

        <View className="gap-1">
          <Text className="text-sm font-medium text-content-tertiary">
            Endereço
          </Text>
          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, value } }) => (
              <AddressAutocomplete
                value={value}
                onChange={onChange}
                onSelect={result => {
                  onChange(result.placeName)
                  setValue('latitude', result.latitude, {
                    shouldValidate: true,
                  })
                  setValue('longitude', result.longitude, {
                    shouldValidate: true,
                  })
                }}
                hasError={!!errors.address}
              />
            )}
          />
          {errors.address && (
            <Text className="text-content text-xs">
              {errors.address.message}
            </Text>
          )}
        </View>

        <View className="gap-1">
          <Text className="text-sm font-medium text-content-tertiary">
            Local no mapa
          </Text>
          <Controller
            control={control}
            name="latitude"
            render={({ field: { onChange: onLat, value: lat } }) => (
              <Controller
                control={control}
                name="longitude"
                render={({ field: { onChange: onLng, value: lng } }) => (
                  <LocationPicker
                    value={
                      typeof lat === 'number' && typeof lng === 'number'
                        ? { latitude: lat, longitude: lng }
                        : null
                    }
                    onChange={coords => {
                      onLat(coords.latitude)
                      onLng(coords.longitude)
                    }}
                    hasError={!!errors.latitude || !!errors.longitude}
                  />
                )}
              />
            )}
          />
          {(errors.latitude || errors.longitude) && (
            <Text className="text-content text-xs">
              Toque no mapa para escolher o local
            </Text>
          )}
        </View>

        <View className="flex-row items-center justify-between bg-surface px-4 py-3 rounded-xl">
          <View className="flex-1">
            <Text className="text-sm font-medium text-content-secondary">
              Evento público
            </Text>
            <Text className="text-xs text-content-muted">
              Visível para qualquer pessoa
            </Text>
          </View>
          <Controller
            control={control}
            name="isPublic"
            render={({ field: { onChange, value } }) => (
              <Switch value={value} onValueChange={onChange} />
            )}
          />
        </View>

        {imagesSection}

        <FormError message={submitError ? errorMessage : null} />

        <Button
          label={submitting ? submittingLabel : submitLabel}
          onPress={handleSubmit(onSubmit)}
          loading={submitting}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

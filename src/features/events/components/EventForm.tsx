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
import { LocationPicker } from './LocationPicker'
import { AddressAutocomplete } from './AddressAutocomplete'

const CATEGORIES = [
  'Música',
  'Esporte',
  'Tecnologia',
  'Festa',
  'Educação',
  'Outro',
]

const DEFAULTS: Partial<CreateEventInput> = {
  title: '',
  description: '',
  address: '',
  category: '',
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
          <Text className="text-sm font-medium text-zinc-300">Título</Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className={`border ${errors.title ? 'border-white' : 'border-zinc-800'} bg-zinc-900 rounded-xl px-4 py-3.5 text-base text-white`}
                placeholder="Festival de música no parque"
                placeholderTextColor="#71717a"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.title && (
            <Text className="text-white text-xs">{errors.title.message}</Text>
          )}
        </View>

        <View className="gap-1">
          <Text className="text-sm font-medium text-zinc-300">Descrição</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className={`border ${errors.description ? 'border-white' : 'border-zinc-800'} bg-zinc-900 rounded-xl px-4 py-3.5 text-base text-white min-h-[96px]`}
                placeholder="Conte mais sobre o evento..."
                placeholderTextColor="#71717a"
                value={value ?? ''}
                onChangeText={onChange}
                multiline
                textAlignVertical="top"
              />
            )}
          />
          {errors.description && (
            <Text className="text-white text-xs">
              {errors.description.message}
            </Text>
          )}
        </View>

        <View className="gap-1">
          <Text className="text-sm font-medium text-zinc-300">Data e hora</Text>
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
            <Text className="text-white text-xs">{errors.date.message}</Text>
          )}
        </View>

        <View className="gap-1">
          <Text className="text-sm font-medium text-zinc-300">
            Horário de término{' '}
            <Text className="text-zinc-500 text-xs">(opcional)</Text>
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
            <Text className="text-white text-xs">
              {errors.endDate.message}
            </Text>
          )}
        </View>

        <View className="gap-1">
          <Text className="text-sm font-medium text-zinc-300">Categoria</Text>
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row flex-wrap gap-2">
                {CATEGORIES.map(category => {
                  const active = value === category
                  return (
                    <Text
                      key={category}
                      onPress={() => onChange(category)}
                      className={`px-4 py-2 rounded-full text-sm ${active ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-200'}`}
                    >
                      {category}
                    </Text>
                  )
                })}
              </View>
            )}
          />
          {errors.category && (
            <Text className="text-white text-xs">
              {errors.category.message}
            </Text>
          )}
        </View>

        <View className="gap-1">
          <Text className="text-sm font-medium text-zinc-300">Endereço</Text>
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
            <Text className="text-white text-xs">
              {errors.address.message}
            </Text>
          )}
        </View>

        <View className="gap-1">
          <Text className="text-sm font-medium text-zinc-300">
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
            <Text className="text-white text-xs">
              Toque no mapa para escolher o local
            </Text>
          )}
        </View>

        <View className="flex-row items-center justify-between bg-zinc-900 px-4 py-3 rounded-xl">
          <View className="flex-1">
            <Text className="text-sm font-medium text-zinc-200">
              Evento público
            </Text>
            <Text className="text-xs text-zinc-400">
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

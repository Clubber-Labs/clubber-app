import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native'
import { GlobeIcon, LockIcon } from 'phosphor-react-native'
import { useForm, Controller, type Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createEventSchema,
  type CreateEventInput,
} from '../schemas/createEventSchema'
import type { ReactNode } from 'react'
import { FormSubmitButton } from '@/shared/components/FormSubmitButton'
import { FormError } from '@/shared/components/FormError'
import { DatePicker } from '@/shared/components/DatePicker'
import { CategoryMultiSelect } from '@/shared/components/CategoryMultiSelect'
import { SubcategorySelect } from '@/shared/components/SubcategorySelect'
import { LocationPreview } from './LocationPreview'
import { VenuePicker, type VenueSelection } from './VenuePicker'
import { useUserLocation } from '@/shared/hooks/useUserLocation'
import { useKeyboardAwareForm } from '@/shared/hooks/useKeyboardAwareForm'
import { colors } from '@/shared/theme'

// Identidade estável: o useWatch do FormSubmitButton tem `name` nas deps do
// efeito de subscrição, e um literal inline re-assinaria a cada tecla digitada.
const REQUIRED_FIELDS: Path<CreateEventInput>[] = [
  'title',
  'date',
  'categories',
  'address',
  'latitude',
]

const DEFAULTS: Partial<CreateEventInput> = {
  title: '',
  description: '',
  address: '',
  categories: [],
  subcategories: [],
  isPublic: true,
  placeId: null,
  venueName: null,
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
  const selectedCategories = watch('categories')
  const address = watch('address')
  const venueName = watch('venueName')
  const placeId = watch('placeId')
  const latitude = watch('latitude')
  const longitude = watch('longitude')
  const { coords } = useUserLocation()
  const form = useKeyboardAwareForm()

  function patchLocation(patch: Partial<VenueSelection>) {
    if ('address' in patch)
      setValue('address', patch.address ?? '', { shouldValidate: true })
    if ('venueName' in patch) setValue('venueName', patch.venueName)
    if ('placeId' in patch) setValue('placeId', patch.placeId)
    if (typeof patch.latitude === 'number')
      setValue('latitude', patch.latitude, { shouldValidate: true })
    if (typeof patch.longitude === 'number')
      setValue('longitude', patch.longitude, { shouldValidate: true })
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        {...form.scrollProps}
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
      >
        {imagesSection}

        <View className="gap-1" {...form.anchor('title')}>
          <Text className="text-sm font-medium text-content-tertiary">
            Título
          </Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <TextInput
                {...form.input('title')}
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

        <View className="gap-1" {...form.anchor('description')}>
          <Text className="text-sm font-medium text-content-tertiary">
            Descrição
          </Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <TextInput
                {...form.input('description')}
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

        <View className="gap-1" {...form.anchor('date')}>
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

        <View className="gap-1" {...form.anchor('endDate')}>
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

        <View className="gap-1" {...form.anchor('categories')}>
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

        <View className="gap-1" {...form.anchor('subcategories')}>
          <Text className="text-sm font-medium text-content-tertiary">
            Interesses{' '}
            <Text className="text-content-subtle text-xs">(opcional)</Text>
          </Text>
          <Controller
            control={control}
            name="subcategories"
            render={({ field: { onChange, value } }) => (
              <SubcategorySelect
                selectedCategories={selectedCategories}
                value={value}
                onChange={onChange}
              />
            )}
          />
          {errors.subcategories && (
            <Text className="text-content text-xs">
              {errors.subcategories.message}
            </Text>
          )}
        </View>

        <View className="gap-1" {...form.anchor('address')}>
          <Text className="text-sm font-medium text-content-tertiary">
            Local
          </Text>
          <VenuePicker
            value={{
              address: address ?? '',
              venueName: venueName ?? null,
              placeId: placeId ?? null,
            }}
            onChange={patchLocation}
            coords={coords}
            hasError={!!errors.address}
          />
          {errors.address && (
            <Text className="text-content text-xs">
              {errors.address.message}
            </Text>
          )}
        </View>

        <View className="gap-1" {...form.anchor('latitude')}>
          <Text className="text-sm font-medium text-content-tertiary">
            Local no mapa
          </Text>
          <LocationPreview
            value={
              typeof latitude === 'number' && typeof longitude === 'number'
                ? { latitude, longitude }
                : null
            }
            hasError={!!errors.latitude || !!errors.longitude}
            categories={selectedCategories}
          />
          {(errors.latitude || errors.longitude) && (
            <Text className="text-content text-xs">
              Escolha um local no campo acima
            </Text>
          )}
        </View>

        <Controller
          control={control}
          name="isPublic"
          render={({ field: { onChange, value } }) => (
            <View className="gap-1">
              <Text className="text-sm font-medium text-content-tertiary">
                Quem vê
              </Text>
              <View className="flex-row gap-1 bg-surface border border-line rounded-xl p-1">
                {([true, false] as const).map(option => {
                  const active = value === option
                  const VisibilityIcon = option ? GlobeIcon : LockIcon
                  return (
                    <Pressable
                      key={String(option)}
                      onPress={() => onChange(option)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2.5 ${
                        active ? 'bg-surface-elevated' : ''
                      }`}
                    >
                      <VisibilityIcon
                        size={16}
                        color={active ? colors.content : colors.contentMuted}
                      />
                      <Text
                        className={`text-sm font-semibold ${
                          active ? 'text-content' : 'text-content-muted'
                        }`}
                      >
                        {option ? 'Público' : 'Privado'}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
              <Text className="text-xs text-content-muted">
                {value
                  ? 'Qualquer pessoa pode ver e participar do evento.'
                  : 'Só quem você convidar pode ver o evento.'}
              </Text>
            </View>
          )}
        />
      </ScrollView>

      <View className="border-t border-line bg-surface-sunken px-5 pt-4 pb-12 gap-3">
        <FormError message={submitError ? errorMessage : null} />
        <FormSubmitButton
          control={control}
          required={REQUIRED_FIELDS}
          label={submitting ? submittingLabel : submitLabel}
          onPress={handleSubmit(onSubmit, form.focusFirstError)}
          loading={submitting}
        />
      </View>
    </KeyboardAvoidingView>
  )
}

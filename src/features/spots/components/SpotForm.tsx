import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native'
import {
  SparkleIcon,
  GlobeIcon,
  UsersIcon,
  ChatCircleIcon,
} from 'phosphor-react-native'
import { useForm, Controller, type Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
import { FormSubmitButton } from '@/shared/components/FormSubmitButton'
import { FormError } from '@/shared/components/FormError'
import { DatePicker } from '@/shared/components/DatePicker'
import { CategoryMultiSelect } from '@/shared/components/CategoryMultiSelect'
import { SubcategorySelect } from '@/shared/components/SubcategorySelect'
import {
  createSpotSchema,
  SPOT_MAX_WINDOW_MS,
  type CreateSpotInput,
} from '../schemas/createSpotSchema'
import { spotPresetWindow, type SpotTimePreset } from '../utils/spotTimePresets'
import { useKeyboardAwareForm } from '@/shared/hooks/useKeyboardAwareForm'
import { colors } from '@/shared/theme'

// Identidade estável: o useWatch do FormSubmitButton tem `name` nas deps do
import {
  useFormErrorBanner,
  messagesFromErrors,
} from '@/shared/hooks/useFormErrorBanner'
// efeito de subscrição, e um literal inline re-assinaria a cada tecla digitada.
const REQUIRED_FIELDS: Path<CreateSpotInput>[] = [
  'title',
  'categories',
  'startsAt',
  'endsAt',
]

const MAX_CATEGORIES = 5

// Atalhos de horário: 'custom' revela os date-pickers; os demais preenchem
// início/fim num toque (a janela é calculada em spotPresetWindow).
const TIME_PRESETS = [
  { key: 'now2h', label: 'Agora', sub: 'por 2h' },
  { key: 'tonight', label: 'Hoje à noite', sub: '20h–24h' },
  { key: 'custom', label: 'Escolher', sub: 'até 24h' },
] as const

type Props = {
  // Sempre vem do candidato escolhido — inclui placeId/latitude/longitude.
  defaultValues: Partial<CreateSpotInput>
  onSubmit: (data: CreateSpotInput) => void
  submitting: boolean
  submitError: string | null
  headerSection?: ReactNode
}

// Transparência (LGPD): o usuário precisa saber o que expõe ANTES de publicar.
const VISIBILITY_HINTS: Record<'PUBLIC' | 'FRIENDS', string> = {
  PUBLIC:
    'Qualquer pessoa verá o lugar, o horário e sua foto de perfil no mapa.',
  FRIENDS:
    'Visível só para amigos mútuos (quem você segue e te segue de volta).',
}

export function SpotForm({
  defaultValues,
  onSubmit,
  submitting,
  submitError,
  headerSection,
}: Props) {
  // Teto fixado na montagem; o schema revalida contra o relógio no submit.
  const [maxEndsAt] = useState(() => new Date(Date.now() + SPOT_MAX_WINDOW_MS))

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateSpotInput>({
    resolver: zodResolver(createSpotSchema),
    defaultValues,
  })

  // O publish já entrega a janela default de 2h, então o atalho "Agora" começa
  // selecionado. 'custom' revela os pickers; os outros preenchem início/fim.
  const [timePreset, setTimePreset] = useState<SpotTimePreset>('now2h')

  function applyPreset(preset: SpotTimePreset) {
    setTimePreset(preset)
    const window = spotPresetWindow(preset, new Date())
    if (window) {
      setValue('startsAt', window.startsAt, { shouldValidate: true })
      setValue('endsAt', window.endsAt, { shouldValidate: true })
    }
  }

  const startsAt = watch('startsAt')
  const selectedCategories = watch('categories')
  const form = useKeyboardAwareForm()
  const showFormErrors = useFormErrorBanner(form)

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        {...form.scrollProps}
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
      >
        {headerSection}

        <View className="gap-1" {...form.anchor('title')}>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium text-content-tertiary">
              Título
            </Text>
            <View className="flex-row items-center gap-1 rounded-full bg-brand-surface border border-brand-surface-strong px-2 py-0.5">
              <SparkleIcon size={10} color={colors.brandText} />
              <Text className="text-brand-text text-[10px] font-bold">
                sugerido pela IA
              </Text>
            </View>
          </View>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <TextInput
                {...form.input('title')}
                className={`border ${errors.title ? 'border-content' : 'border-line'} bg-surface rounded-xl px-4 py-3.5 text-base text-content`}
                placeholder="Como você chamaria esse rolê?"
                placeholderTextColor={colors.contentSubtle}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
        </View>

        <View className="gap-1" {...form.anchor('description')}>
          <Text className="text-sm font-medium text-content-tertiary">
            Descrição{' '}
            <Text className="text-content-subtle text-xs">(opcional)</Text>
          </Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <TextInput
                {...form.input('description')}
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
        </View>

        <View className="gap-1" {...form.anchor('startsAt')}>
          <Text className="text-sm font-medium text-content-tertiary">
            Quando
          </Text>
          <View className="flex-row gap-2">
            {TIME_PRESETS.map(option => {
              const active = timePreset === option.key
              return (
                <Pressable
                  key={option.key}
                  onPress={() => applyPreset(option.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  className={`flex-1 items-center rounded-xl border py-2.5 ${
                    active ? 'bg-brand border-brand' : 'bg-surface border-line'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      active ? 'text-content' : 'text-content-muted'
                    }`}
                  >
                    {option.label}
                  </Text>
                  <Text
                    className={`text-[10px] ${
                      active ? 'text-brand-text-bright' : 'text-content-subtle'
                    }`}
                  >
                    {option.sub}
                  </Text>
                </Pressable>
              )
            })}
          </View>

          {timePreset === 'custom' && (
            <View className="gap-3 pt-1">
              <View className="gap-1">
                <Text className="text-sm font-medium text-content-tertiary">
                  Começa
                </Text>
                <Controller
                  control={control}
                  name="startsAt"
                  render={({ field: { onChange, value } }) => (
                    <DatePicker
                      value={value}
                      onChange={onChange}
                      mode="datetime"
                      placeholder="Quando começa"
                      minimumDate={new Date()}
                      maximumDate={maxEndsAt}
                      hasError={!!errors.startsAt}
                    />
                  )}
                />
              </View>
              <View className="gap-1" {...form.anchor('endsAt')}>
                <Text className="text-sm font-medium text-content-tertiary">
                  Termina
                </Text>
                <Controller
                  control={control}
                  name="endsAt"
                  render={({ field: { onChange, value } }) => (
                    <DatePicker
                      value={value}
                      onChange={onChange}
                      mode="datetime"
                      placeholder="Quando termina"
                      minimumDate={startsAt ?? new Date()}
                      // Curta duração: no máximo 24h a partir de agora.
                      maximumDate={maxEndsAt}
                      hasError={!!errors.endsAt}
                    />
                  )}
                />
              </View>
            </View>
          )}

          <Text className="text-content-subtle text-xs">
            O rolê pode durar no máximo 24 horas.
          </Text>
        </View>

        <View className="gap-1" {...form.anchor('categories')}>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium text-content-tertiary">
              Categorias
            </Text>
            <Text className="text-content-subtle text-xs">1 a 5</Text>
          </View>
          <Controller
            control={control}
            name="categories"
            render={({ field: { onChange, value } }) => (
              <CategoryMultiSelect
                value={value}
                onChange={onChange}
                max={MAX_CATEGORIES}
              />
            )}
          />
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
                value={value ?? []}
                onChange={onChange}
              />
            )}
          />
        </View>

        <Controller
          control={control}
          name="visibility"
          render={({ field: { onChange, value } }) => (
            <View className="gap-1">
              <Text className="text-sm font-medium text-content-tertiary">
                Quem vê
              </Text>
              <View className="flex-row gap-1 bg-surface border border-line rounded-xl p-1">
                {(['PUBLIC', 'FRIENDS'] as const).map(option => {
                  const active = value === option
                  const isPublic = option === 'PUBLIC'
                  const VisibilityIcon = isPublic ? GlobeIcon : UsersIcon
                  return (
                    <Pressable
                      key={option}
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
                        {isPublic ? 'Público' : 'Amigos'}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
              <Text className="text-xs text-content-muted">
                {VISIBILITY_HINTS[value]}
              </Text>
            </View>
          )}
        />
      </ScrollView>

      <View className="border-t border-line bg-surface-sunken px-5 pt-3 pb-5 gap-3">
        <FormError message={submitError} />
        <View className="flex-row items-center justify-center gap-2">
          <ChatCircleIcon size={14} color={colors.contentMuted} />
          <Text className="text-content-muted text-xs">
            Publicar cria o{' '}
            <Text className="text-content-secondary font-semibold">
              grupo de chat
            </Text>{' '}
            do rolê
          </Text>
        </View>
        <FormSubmitButton
          control={control}
          required={REQUIRED_FIELDS}
          label={submitting ? 'Publicando...' : 'Publicar rolê'}
          icon={SparkleIcon}
          onPress={handleSubmit(onSubmit, errors =>
            showFormErrors(messagesFromErrors(errors)),
          )}
          loading={submitting}
        />
      </View>
    </KeyboardAvoidingView>
  )
}

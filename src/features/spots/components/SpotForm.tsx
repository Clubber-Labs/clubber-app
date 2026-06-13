import { useState } from 'react'
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
import type { ReactNode } from 'react'
import { Button } from '@/shared/components/Button'
import { FormError } from '@/shared/components/FormError'
import { DatePicker } from '@/shared/components/DatePicker'
import { CategoryMultiSelect } from '@/shared/components/CategoryMultiSelect'
import {
  createSpotSchema,
  SPOT_MAX_WINDOW_MS,
  type CreateSpotInput,
} from '../schemas/createSpotSchema'
import { colors } from '@/shared/theme'

const MAX_CATEGORIES = 5

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
    formState: { errors },
  } = useForm<CreateSpotInput>({
    resolver: zodResolver(createSpotSchema),
    defaultValues,
  })

  const startsAt = watch('startsAt')

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {headerSection}

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
                placeholder="Como você chamaria esse rolê?"
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
          {errors.startsAt && (
            <Text className="text-content text-xs">
              {errors.startsAt.message}
            </Text>
          )}
        </View>

        <View className="gap-1">
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
                // Spot é rolê de curta duração: no máximo 24h a partir de agora.
                maximumDate={maxEndsAt}
                hasError={!!errors.endsAt}
              />
            )}
          />
          <Text className="text-content-subtle text-xs">
            O rolê pode durar no máximo 24 horas.
          </Text>
          {errors.endsAt && (
            <Text className="text-content text-xs">
              {errors.endsAt.message}
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
              <CategoryMultiSelect
                value={value}
                onChange={onChange}
                max={MAX_CATEGORIES}
              />
            )}
          />
          {errors.categories && (
            <Text className="text-content text-xs">
              {errors.categories.message}
            </Text>
          )}
        </View>

        <Controller
          control={control}
          name="visibility"
          render={({ field: { onChange, value } }) => (
            <View className="flex-row items-center justify-between bg-surface px-4 py-3 rounded-xl">
              <View className="flex-1 pr-3">
                <Text className="text-sm font-medium text-content-secondary">
                  Spot público
                </Text>
                <Text className="text-xs text-content-muted">
                  {VISIBILITY_HINTS[value]}
                </Text>
              </View>
              <Switch
                value={value === 'PUBLIC'}
                onValueChange={isPublic =>
                  onChange(isPublic ? 'PUBLIC' : 'FRIENDS')
                }
                trackColor={{ true: colors.brand, false: colors.lineStrong }}
                thumbColor={colors.content}
              />
            </View>
          )}
        />

        <FormError message={submitError} />

        <Button
          label={submitting ? 'Publicando...' : 'Publicar spot'}
          onPress={handleSubmit(onSubmit)}
          loading={submitting}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

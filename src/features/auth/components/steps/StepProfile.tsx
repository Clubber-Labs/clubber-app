import { View, Text, TextInput, Switch } from 'react-native'
import { Controller } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'
import { CategoryMultiSelect } from '@/shared/components/CategoryMultiSelect'
import type { RegisterInput } from '../../schemas/registerSchema'
import { colors } from '@/shared/theme'

type Props = {
  control: Control<RegisterInput>
  errors: FieldErrors<RegisterInput>
}

export function StepProfile({ control, errors }: Props) {
  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-content">Seu perfil</Text>
        <Text className="text-sm text-content-muted">
          Opcional — você pode preencher depois.
        </Text>
      </View>

      <View className="gap-4">
        <View className="gap-1">
          <Text className="text-sm font-medium text-content-tertiary">Bio</Text>
          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className={`border ${errors.bio ? 'border-content' : 'border-line'} bg-surface rounded-xl px-4 py-3.5 text-base text-content`}
                placeholder="Conte algo sobre você..."
                placeholderTextColor={colors.contentSubtle}
                onChangeText={onChange}
                value={value}
                multiline
                numberOfLines={4}
              />
            )}
          />
          {errors.bio && (
            <Text className="text-content text-xs">{errors.bio.message}</Text>
          )}
        </View>

        <View className="flex-row items-center justify-between bg-surface border border-line rounded-xl px-4 py-3.5">
          <View className="gap-0.5">
            <Text className="text-base font-medium text-content">
              Perfil privado
            </Text>
            <Text className="text-xs text-content-muted">
              Apenas seguidores aprovados verão seu conteúdo
            </Text>
          </View>
          <Controller
            control={control}
            name="isPrivate"
            render={({ field: { onChange, value } }) => (
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{
                  false: colors.contentSecondary,
                  true: colors.brandEmphasis,
                }}
                thumbColor={colors.content}
              />
            )}
          />
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-content-tertiary">
            Categorias de interesse
          </Text>
          <Text className="text-xs text-content-subtle">
            Ajuda a personalizar seu feed com eventos que combinam com você.
          </Text>
          <Controller
            control={control}
            name="preferredCategories"
            render={({ field: { onChange, value } }) => (
              <CategoryMultiSelect value={value ?? []} onChange={onChange} />
            )}
          />
          {errors.preferredCategories && (
            <Text className="text-content text-xs">
              {errors.preferredCategories.message}
            </Text>
          )}
        </View>
      </View>
    </View>
  )
}

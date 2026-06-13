import { View, Text, TextInput, Switch, Pressable } from 'react-native'
import { Controller } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'
import { CategoryMultiSelect } from '@/shared/components/CategoryMultiSelect'
import type { CompleteProfileInput } from '../../schemas/completeProfileSchema'
import { colors } from '@/shared/theme'

type Props = {
  control: Control<CompleteProfileInput>
  errors: FieldErrors<CompleteProfileInput>
}

export function StepInterests({ control, errors }: Props) {
  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-content">Quase lá</Text>
        <Text className="text-sm text-content-muted">
          Personalize seu perfil e o que aparece no seu feed.
        </Text>
      </View>

      <View className="gap-5">
        <View className="gap-2">
          <Text className="text-sm font-medium text-content-tertiary">
            Categorias de interesse
          </Text>
          <Text className="text-xs text-content-subtle">
            Escolha temas de eventos pra personalizar seu feed. Dá pra mudar
            depois.
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

        <View className="gap-1">
          <Text className="text-sm font-medium text-content-tertiary">
            Bio <Text className="text-content-subtle text-xs">(opcional)</Text>
          </Text>
          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                className={`border ${errors.bio ? 'border-content' : 'border-line'} bg-surface rounded-xl px-4 py-3.5 text-base text-content`}
                placeholder="Conte algo sobre você..."
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
          {errors.bio && (
            <Text className="text-content text-xs">{errors.bio.message}</Text>
          )}
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
                  Perfil privado
                </Text>
                <Text className="text-content-muted text-xs mt-0.5">
                  Apenas seguidores aprovados verão seu perfil.
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

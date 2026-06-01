import { View, Text, TextInput, Switch, Pressable } from 'react-native'
import { Controller } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'
import { CategoryMultiSelect } from '@/shared/components/CategoryMultiSelect'
import type { CompleteProfileInput } from '../../schemas/completeProfileSchema'

type Props = {
  control: Control<CompleteProfileInput>
  errors: FieldErrors<CompleteProfileInput>
}

export function StepInterests({ control, errors }: Props) {
  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-white">Quase lá</Text>
        <Text className="text-sm text-zinc-400">
          Personalize seu perfil e o que aparece no seu feed.
        </Text>
      </View>

      <View className="gap-5">
        <View className="gap-2">
          <Text className="text-sm font-medium text-zinc-300">
            Categorias de interesse
          </Text>
          <Text className="text-xs text-zinc-500">
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
            <Text className="text-white text-xs">
              {errors.preferredCategories.message}
            </Text>
          )}
        </View>

        <View className="gap-1">
          <Text className="text-sm font-medium text-zinc-300">
            Bio <Text className="text-zinc-500 text-xs">(opcional)</Text>
          </Text>
          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                className={`border ${errors.bio ? 'border-white' : 'border-zinc-800'} bg-zinc-900 rounded-xl px-4 py-3.5 text-base text-white`}
                placeholder="Conte algo sobre você..."
                placeholderTextColor="#71717a"
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
            <Text className="text-white text-xs">{errors.bio.message}</Text>
          )}
        </View>

        <Controller
          control={control}
          name="isPrivate"
          render={({ field: { onChange, value } }) => (
            <Pressable
              onPress={() => onChange(!value)}
              className="flex-row items-center justify-between bg-zinc-900 rounded-xl px-4 py-3.5 border border-zinc-800"
            >
              <View className="flex-1 mr-3">
                <Text className="text-white text-base font-medium">
                  Perfil privado
                </Text>
                <Text className="text-zinc-400 text-xs mt-0.5">
                  Apenas seguidores aprovados verão seu perfil.
                </Text>
              </View>
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: '#3f3f46', true: '#7c3aed' }}
                thumbColor="#ffffff"
              />
            </Pressable>
          )}
        />
      </View>
    </View>
  )
}

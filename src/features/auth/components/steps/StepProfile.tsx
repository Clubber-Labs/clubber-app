import { View, Text, TextInput, Switch } from 'react-native'
import { Controller } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'
import type { RegisterInput } from '../../schemas/registerSchema'

type Props = {
  control: Control<RegisterInput>
  errors: FieldErrors<RegisterInput>
}

export function StepProfile({ control, errors }: Props) {
  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-white">Seu perfil</Text>
        <Text className="text-sm text-zinc-400">
          Opcional — você pode preencher depois.
        </Text>
      </View>

      <View className="gap-4">
        <View className="gap-1">
          <Text className="text-sm font-medium text-zinc-300">Bio</Text>
          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className={`border ${errors.bio ? 'border-white' : 'border-zinc-800'} bg-zinc-900 rounded-xl px-4 py-3.5 text-base text-white`}
                placeholder="Conte algo sobre você..."
                placeholderTextColor="#71717a"
                onChangeText={onChange}
                value={value}
                multiline
                numberOfLines={4}
              />
            )}
          />
          {errors.bio && (
            <Text className="text-white text-xs">{errors.bio.message}</Text>
          )}
        </View>

        <View className="flex-row items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5">
          <View className="gap-0.5">
            <Text className="text-base font-medium text-white">
              Perfil privado
            </Text>
            <Text className="text-xs text-zinc-400">
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
                trackColor={{ false: '#e5e7eb', true: '#8b5cf6' }}
                thumbColor="#fff"
              />
            )}
          />
        </View>
      </View>
    </View>
  )
}

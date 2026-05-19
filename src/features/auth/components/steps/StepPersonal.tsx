import { View, Text, TextInput } from 'react-native'
import { Controller } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'
import type { RegisterInput } from '../../schemas/registerSchema'
import { DatePicker } from '@/shared/components/DatePicker'

type Props = {
  control: Control<RegisterInput>
  errors: FieldErrors<RegisterInput>
}

export function StepPersonal({ control, errors }: Props) {
  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-white">Dados pessoais</Text>
        <Text className="text-sm text-zinc-400">
          Seu nome real ajuda as pessoas a te encontrarem.
        </Text>
      </View>

      <View className="gap-4">
        <View className="flex-row gap-3">
          <View className="flex-1 gap-1">
            <Text className="text-sm font-medium text-zinc-300">Nome</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className={`border ${errors.name ? 'border-white' : 'border-zinc-800'} bg-zinc-900 rounded-xl px-4 py-3.5 text-base text-white`}
                  placeholder="João"
                  placeholderTextColor="#71717a"
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="words"
                />
              )}
            />
            {errors.name && (
              <Text className="text-white text-xs">
                {errors.name.message}
              </Text>
            )}
          </View>

          <View className="flex-1 gap-1">
            <Text className="text-sm font-medium text-zinc-300">Sobrenome</Text>
            <Controller
              control={control}
              name="lastname"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className={`border ${errors.lastname ? 'border-white' : 'border-zinc-800'} bg-zinc-900 rounded-xl px-4 py-3.5 text-base text-white`}
                  placeholder="Silva"
                  placeholderTextColor="#71717a"
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="words"
                />
              )}
            />
            {errors.lastname && (
              <Text className="text-white text-xs">
                {errors.lastname.message}
              </Text>
            )}
          </View>
        </View>

        <View className="gap-1">
          <Text className="text-sm font-medium text-zinc-300">
            Data de nascimento
          </Text>
          <Controller
            control={control}
            name="birthdate"
            render={({ field: { onChange, value } }) => (
              <DatePicker
                value={value}
                onChange={onChange}
                placeholder="Selecione sua data de nascimento"
                maximumDate={new Date()}
                hasError={!!errors.birthdate}
              />
            )}
          />
          {errors.birthdate && (
            <Text className="text-white text-xs">
              {errors.birthdate.message}
            </Text>
          )}
        </View>
      </View>
    </View>
  )
}

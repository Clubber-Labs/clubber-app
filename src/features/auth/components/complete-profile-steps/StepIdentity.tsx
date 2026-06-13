import { View, Text, TextInput } from 'react-native'
import { Controller } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'
import { DatePicker } from '@/shared/components/DatePicker'
import type { CompleteProfileInput } from '../../schemas/completeProfileSchema'
import { colors } from '@/shared/theme'

type Props = {
  control: Control<CompleteProfileInput>
  errors: FieldErrors<CompleteProfileInput>
}

export function StepIdentity({ control, errors }: Props) {
  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-content">Como te chamam?</Text>
        <Text className="text-sm text-content-muted">
          Confirme seu nome e quando você nasceu.
        </Text>
      </View>

      <View className="gap-4">
        <View className="flex-row gap-3">
          <View className="flex-1 gap-1">
            <Text className="text-sm font-medium text-content-tertiary">
              Nome
            </Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  className={`border ${errors.name ? 'border-content' : 'border-line'} bg-surface rounded-xl px-4 py-3.5 text-base text-content`}
                  placeholder="João"
                  placeholderTextColor={colors.contentSubtle}
                  autoCapitalize="words"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                />
              )}
            />
            {errors.name && (
              <Text className="text-content text-xs">
                {errors.name.message}
              </Text>
            )}
          </View>

          <View className="flex-1 gap-1">
            <Text className="text-sm font-medium text-content-tertiary">
              Sobrenome
            </Text>
            <Controller
              control={control}
              name="lastname"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  className={`border ${errors.lastname ? 'border-content' : 'border-line'} bg-surface rounded-xl px-4 py-3.5 text-base text-content`}
                  placeholder="Silva"
                  placeholderTextColor={colors.contentSubtle}
                  autoCapitalize="words"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                />
              )}
            />
            {errors.lastname && (
              <Text className="text-content text-xs">
                {errors.lastname.message}
              </Text>
            )}
          </View>
        </View>

        <View className="gap-1">
          <Text className="text-sm font-medium text-content-tertiary">
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
            <Text className="text-content text-xs">
              {errors.birthdate.message}
            </Text>
          )}
        </View>
      </View>
    </View>
  )
}

import { useEffect, type ReactNode } from 'react'
import { View, Text, TextInput, Switch, Pressable } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  editProfileSchema,
  type EditProfileInput,
} from '../schemas/editProfileSchema'
import { Button } from '@/shared/components/Button'
import { DatePicker } from '@/shared/components/DatePicker'
import { FormError } from '@/shared/components/FormError'
import { parseLocalDate } from '@/shared/utils/dateFormat'
import type { UserProfile } from '@/shared/types'

type Props = {
  profile: UserProfile
  saving: boolean
  inlineError: string | null
  avatarChanged?: boolean
  onSubmit: (values: EditProfileInput) => void
  onCancel: () => void
}

const inputBase =
  'bg-zinc-900 rounded-xl px-4 py-3.5 text-base text-white border'
const inputOk = 'border-zinc-800'
const inputErr = 'border-red-400'

function defaultsFromProfile(profile: UserProfile): EditProfileInput {
  return {
    name: profile.name,
    lastname: profile.lastname,
    username: profile.username,
    phone: profile.phone ?? '',
    bio: profile.bio ?? '',
    isPrivate: profile.isPrivate,
    birthdate: profile.birthdate ? parseLocalDate(profile.birthdate) : undefined,
  }
}

export function EditProfileForm({
  profile,
  saving,
  inlineError,
  avatarChanged = false,
  onSubmit,
  onCancel,
}: Props) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditProfileInput>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: defaultsFromProfile(profile),
  })

  useEffect(() => {
    reset(defaultsFromProfile(profile))
  }, [profile, reset])

  return (
    <View className="gap-4">
      <Field label="Nome" error={errors.name?.message}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              className={`${inputBase} ${errors.name ? inputErr : inputOk}`}
              placeholderTextColor="#71717a"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
            />
          )}
        />
      </Field>

      <Field label="Sobrenome" error={errors.lastname?.message}>
        <Controller
          control={control}
          name="lastname"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              className={`${inputBase} ${errors.lastname ? inputErr : inputOk}`}
              placeholderTextColor="#71717a"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
            />
          )}
        />
      </Field>

      <Field label="Nome de usuário" error={errors.username?.message}>
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              className={`${inputBase} ${errors.username ? inputErr : inputOk}`}
              placeholderTextColor="#71717a"
              autoCapitalize="none"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
            />
          )}
        />
      </Field>

      <Field label="Telefone" error={errors.phone?.message}>
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              className={`${inputBase} ${errors.phone ? inputErr : inputOk}`}
              placeholderTextColor="#71717a"
              keyboardType="number-pad"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
            />
          )}
        />
      </Field>

      <Field label="Data de nascimento" error={errors.birthdate?.message}>
        <Controller
          control={control}
          name="birthdate"
          render={({ field: { onChange, value } }) => (
            <DatePicker
              value={value}
              onChange={onChange}
              maximumDate={new Date()}
              hasError={!!errors.birthdate}
            />
          )}
        />
      </Field>

      <Field label="Bio" error={errors.bio?.message}>
        <Controller
          control={control}
          name="bio"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              className={`${inputBase} ${errors.bio ? inputErr : inputOk}`}
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
      </Field>

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

      <FormError message={inlineError} />

      <View className="flex-row gap-3 mt-2">
        <View className="flex-1">
          <Button label="Cancelar" onPress={onCancel} variant="secondary" />
        </View>
        <View className="flex-1">
          <Button
            label={saving ? 'Salvando...' : 'Salvar'}
            onPress={handleSubmit(onSubmit)}
            loading={saving}
            disabled={(!isDirty && !avatarChanged) || saving}
          />
        </View>
      </View>
    </View>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <View className="gap-1.5">
      <Text className="text-zinc-400 text-xs font-medium uppercase tracking-wider">
        {label}
      </Text>
      {children}
      {error && <Text className="text-red-500 text-sm">{error}</Text>}
    </View>
  )
}

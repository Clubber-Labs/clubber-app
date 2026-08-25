import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  type KeyboardTypeOptions,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { EditFieldScaffold } from './EditFieldScaffold'
import { useEditProfileField } from '../../hooks/useEditProfileField'
import { editProfileSchema } from '../../schemas/editProfileSchema'
import type { UpdateMePayload } from '../../services/usersService'
import type { UserProfile } from '@/shared/types'
import { colors } from '@/shared/theme'
import { USERNAME_MAX_LENGTH, sanitizeUsername } from '@/shared/utils/username'

// Campos de texto editáveis um a um. Reúsa a casca e a validação por campo do
// editProfileSchema — cada tela manda só o PATCH do seu campo.
export type TextFieldKey = 'name' | 'lastname' | 'username' | 'phone' | 'bio'

// Chaves, não frases: a constante avalia no import e congelaria o idioma. As
// uniões mantêm o gate do typecheck — chave inexistente não compila.
type TitleKey = `profile.fields.${TextFieldKey}.title`
type HelpKey = `profile.fields.${Exclude<TextFieldKey, 'bio'>}.help`

type FieldConfig = {
  titleKey: TitleKey
  // Bio troca o help pelo contador de caracteres — sem chave.
  helpKey: HelpKey | null
  keyboardType?: KeyboardTypeOptions
  autoCapitalize?: 'none' | 'words' | 'sentences'
  multiline?: boolean
  maxLength?: number
  prefix?: string
  sanitize?: (text: string) => string
}

const FIELDS: Record<TextFieldKey, FieldConfig> = {
  name: {
    titleKey: 'profile.fields.name.title',
    helpKey: 'profile.fields.name.help',
    autoCapitalize: 'words',
    maxLength: 25,
  },
  lastname: {
    titleKey: 'profile.fields.lastname.title',
    helpKey: 'profile.fields.lastname.help',
    autoCapitalize: 'words',
    maxLength: 55,
  },
  username: {
    titleKey: 'profile.fields.username.title',
    helpKey: 'profile.fields.username.help',
    autoCapitalize: 'none',
    maxLength: USERNAME_MAX_LENGTH,
    prefix: '@',
    sanitize: sanitizeUsername,
  },
  phone: {
    titleKey: 'profile.fields.phone.title',
    helpKey: 'profile.fields.phone.help',
    keyboardType: 'number-pad',
    maxLength: 11,
  },
  bio: {
    titleKey: 'profile.fields.bio.title',
    helpKey: null,
    multiline: true,
    maxLength: 255,
  },
}

const TEXT_FIELD_KEYS = Object.keys(FIELDS) as TextFieldKey[]

export function isTextFieldKey(
  value: string | undefined,
): value is TextFieldKey {
  return !!value && TEXT_FIELD_KEYS.includes(value as TextFieldKey)
}

export function EditTextFieldScreen({ field }: { field: TextFieldKey }) {
  const { profile, save, saving, error } = useEditProfileField()

  if (!profile) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={colors.brand} />
      </View>
    )
  }

  return (
    <TextFieldForm
      profile={profile}
      field={field}
      save={save}
      saving={saving}
      serverError={error}
    />
  )
}

type FormProps = {
  profile: UserProfile
  field: TextFieldKey
  save: (patch: UpdateMePayload) => void
  saving: boolean
  serverError: string | null
}

function TextFieldForm({
  profile,
  field,
  save,
  saving,
  serverError,
}: FormProps) {
  const { t } = useTranslation()
  const config = FIELDS[field]
  const initial = String(profile[field] ?? '')
  const [value, setValue] = useState(initial)

  const parsed = editProfileSchema.shape[field].safeParse(value)
  const changed = value !== initial
  const validationError =
    changed && !parsed.success ? parsed.error.issues[0].message : null
  const canSave = changed && parsed.success
  const displayError = validationError ?? serverError

  return (
    <EditFieldScaffold
      title={t(config.titleKey)}
      onSave={() => save({ [field]: value } as UpdateMePayload)}
      saving={saving}
      canSave={canSave}
    >
      {config.multiline ? (
        <TextInput
          className="bg-surface border-[1.5px] border-brand rounded-xl px-4 py-3.5 text-content-secondary text-[15px] leading-6"
          style={{ minHeight: 118, textAlignVertical: 'top' }}
          autoFocus
          multiline
          maxLength={config.maxLength}
          placeholder={t('profile.fields.bio.placeholder')}
          placeholderTextColor={colors.contentSubtle}
          value={value}
          onChangeText={setValue}
        />
      ) : (
        <View className="flex-row items-center gap-2 bg-surface border-[1.5px] border-brand rounded-xl px-4 py-3.5">
          {config.prefix && (
            <Text className="text-content-subtle text-[17px] font-semibold">
              {config.prefix}
            </Text>
          )}
          <TextInput
            className="flex-1 text-content text-[17px] font-semibold p-0"
            autoFocus
            keyboardType={config.keyboardType}
            autoCapitalize={config.autoCapitalize}
            maxLength={config.maxLength}
            value={value}
            onChangeText={text =>
              setValue(config.sanitize ? config.sanitize(text) : text)
            }
          />
        </View>
      )}

      {config.multiline ? (
        <Text className="text-content-subtle text-right text-[12.5px] mt-2.5">
          {value.length}/{config.maxLength}
        </Text>
      ) : (
        <Text className="text-content-subtle text-[12.5px] mt-2.5 leading-5">
          {config.helpKey ? t(config.helpKey) : ''}
        </Text>
      )}

      {displayError && (
        <Text className="text-danger-text text-[12.5px] mt-2">
          {displayError}
        </Text>
      )}
    </EditFieldScaffold>
  )
}

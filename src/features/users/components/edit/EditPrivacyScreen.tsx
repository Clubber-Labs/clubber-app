import { useState } from 'react'
import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { GlobeIcon, LockIcon, InfoIcon } from 'phosphor-react-native'
import { EditFieldScaffold } from './EditFieldScaffold'
import { useEditProfileField } from '../../hooks/useEditProfileField'
import type { UserProfile } from '@/shared/types'
import { colors } from '@/shared/theme'

// Visibilidade do perfil em controle segmentado Público/Privado — mesma
// linguagem do "Quem vê" do evento — com a dica logo abaixo.
export function EditPrivacyScreen() {
  const { profile, save, saving } = useEditProfileField()

  if (!profile) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={colors.brand} />
      </View>
    )
  }

  return <PrivacyForm profile={profile} save={save} saving={saving} />
}

type FormProps = {
  profile: UserProfile
  save: (patch: { isPrivate: boolean }) => void
  saving: boolean
}

function PrivacyForm({ profile, save, saving }: FormProps) {
  const { t } = useTranslation()
  const [isPrivate, setIsPrivate] = useState(profile.isPrivate)
  const canSave = isPrivate !== profile.isPrivate

  return (
    <EditFieldScaffold
      title={t('profile.edit.visibility')}
      onSave={() => save({ isPrivate })}
      saving={saving}
      canSave={canSave}
    >
      <View className="flex-row gap-1 bg-surface border border-line-strong rounded-xl p-1">
        {([false, true] as const).map(priv => {
          const active = isPrivate === priv
          const VisibilityIcon = priv ? LockIcon : GlobeIcon
          return (
            <Pressable
              key={String(priv)}
              onPress={() => setIsPrivate(priv)}
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
                className={`text-sm font-bold ${
                  active ? 'text-content' : 'text-content-muted'
                }`}
              >
                {priv ? t('profile.edit.private') : t('profile.edit.public')}
              </Text>
            </Pressable>
          )
        })}
      </View>

      <View className="flex-row items-start gap-1.5 mt-3">
        <InfoIcon
          size={16}
          color={colors.contentSubtle}
          style={{ marginTop: 1 }}
        />
        <Text className="flex-1 text-content-subtle text-xs leading-5">
          {isPrivate
            ? t('profile.visibility.privateHint')
            : t('profile.visibility.publicHint')}
        </Text>
      </View>
    </EditFieldScaffold>
  )
}

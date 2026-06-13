import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import {
  useMyProfile,
  useUpdateProfile,
  useUploadAvatar,
} from '@/features/users/hooks/useProfile'
import { usePickAvatar } from '@/features/users/hooks/usePickAvatar'
import { EditProfileForm } from '@/features/users/components/EditProfileForm'
import {
  buildProfilePatch,
  isPatchEmpty,
} from '@/features/users/utils/profilePatch'
import type { EditProfileInput } from '@/features/users/schemas/editProfileSchema'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { isConflictError } from '@/shared/lib/apiError'
import { colors } from '@/shared/theme'

export default function EditProfileScreen() {
  const router = useRouter()
  const { data: profile, isLoading } = useMyProfile()
  const update = useUpdateProfile(profile?.id ?? '')
  const uploadAvatar = useUploadAvatar()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [avatarChanged, setAvatarChanged] = useState(false)

  const handlePickAvatar = usePickAvatar(uri =>
    uploadAvatar.mutate(uri, { onSuccess: () => setAvatarChanged(true) }),
  )

  if (isLoading || !profile) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={colors.brand} />
      </View>
    )
  }

  const fullName = `${profile.name} ${profile.lastname}`.trim()

  function handleSubmit(values: EditProfileInput) {
    if (!profile) return

    const patch = buildProfilePatch(profile, values)
    if (isPatchEmpty(patch)) {
      router.back()
      return
    }

    setSubmitError(null)
    update.mutate(patch, {
      onSuccess: () => router.back(),
      onError: err => {
        setSubmitError(
          isConflictError(err)
            ? 'Esse nome de usuário já está em uso.'
            : 'Não foi possível salvar. Tente novamente.',
        )
      },
    })
  }

  function handleCancel() {
    router.back()
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center pt-4 pb-6 gap-3">
          <Pressable
            onPress={handlePickAvatar}
            disabled={uploadAvatar.isPending}
            accessibilityLabel="Alterar foto de perfil"
          >
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                overflow: 'hidden',
              }}
            >
              <UserAvatar
                name={fullName}
                avatarUrl={profile.avatarUrl}
                size={96}
              />
              {uploadAvatar.isPending ? (
                <View className="absolute inset-0 bg-background/60 items-center justify-center">
                  <ActivityIndicator color={colors.content} />
                </View>
              ) : (
                <View className="absolute bottom-0 left-0 right-0 bg-background/50 items-center py-1">
                  <Ionicons name="camera" size={14} color={colors.content} />
                </View>
              )}
            </View>
          </Pressable>
          <Pressable
            onPress={handlePickAvatar}
            disabled={uploadAvatar.isPending}
          >
            <Text className="text-brand-text text-sm font-medium">
              Alterar foto
            </Text>
          </Pressable>
        </View>

        <EditProfileForm
          profile={profile}
          saving={update.isPending}
          inlineError={submitError}
          avatarChanged={avatarChanged}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

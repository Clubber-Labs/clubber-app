import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { UserAvatar } from '@/shared/components/UserAvatar'
import type { UserProfile } from '@/shared/types'

type Props = {
  profile: UserProfile
  isOwnProfile?: boolean
  avatarUploading?: boolean
  onAvatarPress?: () => void
  onEditPress?: () => void
}

const AVATAR_SIZE = 88

export function ProfileHeader({
  profile,
  isOwnProfile,
  avatarUploading,
  onAvatarPress,
  onEditPress,
}: Props) {
  const fullName = `${profile.name} ${profile.lastname}`.trim()
  const editable = isOwnProfile && !!onAvatarPress

  return (
    <View className="items-center pt-6 pb-4 px-6">
      <Pressable
        onPress={editable ? onAvatarPress : undefined}
        disabled={!editable || avatarUploading}
        accessibilityLabel={editable ? 'Alterar foto de perfil' : undefined}
      >
        <View
          style={{
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            borderRadius: AVATAR_SIZE / 2,
            overflow: 'hidden',
          }}
        >
          <UserAvatar
            name={fullName}
            avatarUrl={profile.avatarUrl}
            size={AVATAR_SIZE}
          />
          {editable && !avatarUploading && (
            <View className="absolute bottom-0 left-0 right-0 bg-black/50 items-center py-1">
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          )}
          {avatarUploading && (
            <View className="absolute inset-0 bg-black/60 items-center justify-center">
              <ActivityIndicator color="#fff" />
            </View>
          )}
        </View>
      </Pressable>

      <Text className="text-white font-bold text-xl mt-3">{fullName}</Text>
      <Text className="text-zinc-400 text-sm mt-0.5">@{profile.username}</Text>

      {!!profile.bio && (
        <Text className="text-zinc-300 text-sm text-center mt-2 leading-5">
          {profile.bio}
        </Text>
      )}

      {isOwnProfile && onEditPress && (
        <Pressable
          onPress={onEditPress}
          className="mt-4 border border-zinc-700 rounded-lg px-6 py-2"
        >
          <Text className="text-zinc-200 font-medium text-sm">Editar perfil</Text>
        </Pressable>
      )}
    </View>
  )
}

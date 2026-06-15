import type { ReactNode } from 'react'
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { ProfileStats } from './ProfileStats'
import { ProfilePreferredCategories } from './ProfilePreferredCategories'
import { formatFullName } from '@/shared/utils/fullName'
import type { UserProfile } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  profile: UserProfile
  isOwnProfile?: boolean
  avatarUploading?: boolean
  onAvatarPress?: () => void
  onFollowersPress?: () => void
  onFollowingPress?: () => void
  // Editar (perfil próprio) ou Seguir/Mensagem (de outro) — definido pela tela.
  actions?: ReactNode
}

const AVATAR_SIZE = 80

export function ProfileHeader({
  profile,
  isOwnProfile,
  avatarUploading,
  onAvatarPress,
  onFollowersPress,
  onFollowingPress,
  actions,
}: Props) {
  const fullName = formatFullName(profile.name, profile.lastname)
  const editable = isOwnProfile && !!onAvatarPress
  // id por perfil: evita colisão de gradiente entre o perfil próprio e o de
  // outro usuário coexistindo durante a transição de navegação.
  const backdropId = `profile-backdrop-${profile.id}`

  return (
    <View className="relative">
      {/* Backdrop sutil da marca — identidade sem foto de capa. */}
      <View className="absolute left-0 right-0 top-0" style={{ height: 190 }}>
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <RadialGradient id={backdropId} cx="0.2" cy="0" r="0.95">
              <Stop offset="0" stopColor={colors.brand} stopOpacity={0.26} />
              <Stop offset="0.7" stopColor={colors.brand} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill={`url(#${backdropId})`}
          />
        </Svg>
      </View>

      <View className="px-4 pt-4">
        <View className="flex-row items-center gap-4">
          <Pressable
            onPress={editable ? onAvatarPress : undefined}
            disabled={!editable || avatarUploading}
            accessibilityLabel={editable ? 'Alterar foto de perfil' : undefined}
            className="relative"
          >
            <View
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderRadius: AVATAR_SIZE / 2,
                overflow: 'hidden',
              }}
              className={
                isOwnProfile
                  ? 'border-2 border-brand'
                  : 'border-2 border-line-strong'
              }
            >
              <UserAvatar
                name={fullName}
                avatarUrl={profile.avatarUrl}
                size={AVATAR_SIZE}
              />
              {avatarUploading && (
                <View className="absolute inset-0 items-center justify-center bg-background/60">
                  <ActivityIndicator color={colors.content} />
                </View>
              )}
            </View>
            {editable && !avatarUploading && (
              <View className="absolute -bottom-0.5 -right-0.5 h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-brand">
                <Ionicons name="camera" size={13} color={colors.content} />
              </View>
            )}
          </Pressable>

          <ProfileStats
            eventsCount={profile.eventsCount}
            followersCount={profile.followersCount}
            followingCount={profile.followingCount}
            onFollowersPress={onFollowersPress}
            onFollowingPress={onFollowingPress}
          />
        </View>

        <Text className="text-content mt-3 text-xl font-extrabold">
          {fullName}
        </Text>
        <Text className="text-content-muted mt-0.5 text-sm">
          @{profile.username}
        </Text>

        {!!profile.bio && (
          <Text className="text-content-tertiary mt-2 text-sm leading-5">
            {profile.bio}
          </Text>
        )}

        <ProfilePreferredCategories
          values={profile.preferredCategories ?? []}
        />

        {actions && <View className="mt-4">{actions}</View>}
      </View>
    </View>
  )
}

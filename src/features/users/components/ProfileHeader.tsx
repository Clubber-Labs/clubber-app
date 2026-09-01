import type { ReactNode } from 'react'
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { CameraIcon } from 'phosphor-react-native'
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { ProfileStats } from './ProfileStats'
import { ProfileInterestsRow } from './ProfileInterestsRow'
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
  // Dono do perfil: toque nos interesses abre a folha de edição.
  onInterestsPress?: () => void
  // Editar (perfil próprio) ou Seguir/Mensagem/⋯ (de outro) — definido pela tela.
  actions?: ReactNode
  // Slot entre os interesses e as ações. Existe para o header não precisar
  // conhecer features que o importam: `users` é a folha que as outras puxam,
  // então quem compõe é a tela, que pode importar as duas pontas.
  highlights?: ReactNode
}

const AVATAR_SIZE = 80
const AVATAR_BORDER = 2
// A borda ocupa a área interna da View no RN: a foto precisa descontá-la, senão
// vaza pra direita/baixo e sai do centro do anel.
const AVATAR_INNER = AVATAR_SIZE - AVATAR_BORDER * 2

export function ProfileHeader({
  profile,
  isOwnProfile,
  avatarUploading,
  onAvatarPress,
  onFollowersPress,
  onFollowingPress,
  onInterestsPress,
  actions,
  highlights,
}: Props) {
  const { t } = useTranslation()
  const fullName = formatFullName(profile.name, profile.lastname)
  const editable = isOwnProfile && !!onAvatarPress
  // id por perfil: evita colisão de gradiente entre o perfil próprio e o de
  // outro usuário coexistindo durante a transição de navegação.
  const backdropId = `profile-backdrop-${profile.id}`
  const interests = [
    ...new Set([
      ...(profile.preferredCategories ?? []),
      ...(profile.preferredSubcategories ?? []),
    ]),
  ]

  return (
    <View className="relative bg-background">
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

      <View className="px-4 pb-4 pt-4">
        <View className="flex-row items-center gap-4">
          <Pressable
            onPress={editable ? onAvatarPress : undefined}
            disabled={!editable || avatarUploading}
            accessibilityLabel={
              editable ? t('profile.edit.changePhotoLabel') : undefined
            }
            className="relative"
          >
            <View
              className="border-2 border-line-strong"
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
                size={AVATAR_INNER}
              />
              {avatarUploading && (
                <View className="absolute inset-0 items-center justify-center bg-background/60">
                  <ActivityIndicator color={colors.content} />
                </View>
              )}
            </View>
            {editable && !avatarUploading && (
              <View className="absolute -bottom-0.5 -right-0.5 h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-surface-high">
                <CameraIcon size={13} color={colors.content} />
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

        <Text className="mt-3 text-xl font-extrabold text-content">
          {fullName}
        </Text>
        <Text className="mt-0.5 text-[13px] text-content-muted">
          @{profile.username}
        </Text>

        {!!profile.bio && (
          <Text
            className="mt-2 text-content-tertiary"
            style={{ fontSize: 13, lineHeight: 19 }}
          >
            {profile.bio}
          </Text>
        )}

        <ProfileInterestsRow
          values={interests}
          confirmed={profile.spotifyConfirmedInterests}
          onPress={isOwnProfile ? onInterestsPress : undefined}
        />

        {highlights}

        {actions && <View className="mt-3">{actions}</View>}
      </View>
    </View>
  )
}

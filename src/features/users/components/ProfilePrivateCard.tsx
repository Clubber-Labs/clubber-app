import type { ReactNode } from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { ProfileEventsEmpty } from './ProfileEventsEmpty'
import { formatFullName } from '@/shared/utils/fullName'
import type { ReducedUserProfile } from '../schemas/userProfileResponse'
import { colors } from '@/shared/theme'

type Props = {
  // Variante reduzida de GET /users/:id: conta privada vista por quem não segue.
  // Só expõe avatar, nome, @username e followStatus — nunca bio/contadores.
  profile: ReducedUserProfile
  // Seguir/Solicitar + reportar — montados pela tela conforme o followStatus.
  actions?: ReactNode
}

const AVATAR_SIZE = 80

export function ProfilePrivateCard({ profile, actions }: Props) {
  const fullName = formatFullName(profile.name, profile.lastname)

  return (
    <View className="flex-1 bg-background">
      <View className="items-center px-4 pt-6">
        <View
          style={{
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            borderRadius: AVATAR_SIZE / 2,
            overflow: 'hidden',
          }}
          className="border-2 border-line-strong"
        >
          <UserAvatar
            name={fullName}
            avatarUrl={profile.avatarUrl}
            size={AVATAR_SIZE}
          />
        </View>

        <Text className="text-content mt-3 text-center text-xl font-extrabold">
          {fullName}
        </Text>
        <Text className="text-content-muted mt-0.5 text-sm">
          @{profile.username}
        </Text>

        <View className="mt-2 flex-row items-center gap-1.5">
          <Ionicons name="lock-closed" size={13} color={colors.contentMuted} />
          <Text className="text-content-muted text-xs font-bold uppercase tracking-wide">
            Conta privada
          </Text>
        </View>

        {actions && <View className="mt-5 w-full">{actions}</View>}
      </View>

      <ProfileEventsEmpty variant="private" />
    </View>
  )
}

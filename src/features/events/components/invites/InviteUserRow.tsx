import { Pressable, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { CheckSquareIcon, SquareIcon } from 'phosphor-react-native'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { formatFullName } from '@/shared/utils/fullName'
import { colors } from '@/shared/theme'

// Shape mínimo comum às três origens (seguidores, seguindo, busca) — o que a
// linha precisa pra renderizar e o submit precisa pra enviar.
export type InviteCandidate = {
  id: string
  name: string
  lastname: string
  username: string
  avatarUrl?: string | null
}

type Props = {
  user: InviteCandidate
  checked: boolean
  // Convite já registrado no backend — a linha vira informativa, sem toggle.
  invited: boolean
  onToggle: () => void
}

export function InviteUserRow({ user, checked, invited, onToggle }: Props) {
  const { t } = useTranslation()
  const fullName = formatFullName(user.name, user.lastname)
  return (
    <Pressable
      onPress={onToggle}
      disabled={invited}
      className="flex-row items-center gap-3 px-4 py-3"
      accessibilityRole="checkbox"
      accessibilityState={{ checked: invited || checked, disabled: invited }}
      accessibilityLabel={fullName}
    >
      <UserAvatar name={fullName} avatarUrl={user.avatarUrl} size={44} />
      <View className="flex-1">
        <Text className="text-content font-semibold text-sm">{fullName}</Text>
        <Text className="text-content-muted text-xs">@{user.username}</Text>
      </View>
      {invited ? (
        <Text className="text-content-subtle text-xs">
          {t('events.invites.alreadyInvited')}
        </Text>
      ) : checked ? (
        <CheckSquareIcon weight="fill" size={22} color={colors.brand} />
      ) : (
        <SquareIcon size={22} color={colors.contentSubtle} />
      )}
    </Pressable>
  )
}

import { Pressable, View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { CheckCircleIcon, CircleIcon } from 'phosphor-react-native'
import { UserAvatar } from '@/shared/components/UserAvatar'
import type { UserMini } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  user: UserMini
  selected: boolean
  onToggle: () => void
  // Inerte: já é membro do grupo (sempre junto de `selected`).
  disabled?: boolean
  // Motivo do estado inerte, exibido sob o @username. Sem ele a linha só apaga.
  hint?: string
}

export function UserPickRow({
  user,
  selected,
  onToggle,
  disabled = false,
  hint,
}: Props) {
  const { t } = useTranslation()
  const fullName = `${user.name} ${user.lastname}`.trim()
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      className={`flex-row items-center gap-3 px-4 py-3 ${disabled ? 'opacity-50' : 'active:bg-surface'}`}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={
        selected ? t('chat.people.selected', { name: fullName }) : fullName
      }
      accessibilityHint={hint}
    >
      <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size={44} />
      <View className="flex-1">
        <Text className="text-content-bright font-semibold text-base">
          {user.name} {user.lastname}
        </Text>
        <Text className="text-content-subtle text-sm">@{user.username}</Text>
        {!!hint && (
          <Text className="text-content-muted text-xs mt-0.5">{hint}</Text>
        )}
      </View>
      {selected ? (
        <CheckCircleIcon size={24} color={colors.brandEmphasis} weight="fill" />
      ) : (
        <CircleIcon size={24} color={colors.contentFaint} />
      )}
    </Pressable>
  )
}

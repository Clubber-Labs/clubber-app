import { Pressable, View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { UserAvatar } from '@/shared/components/UserAvatar'
import type { UserMini } from '@/shared/types'

type Props = {
  user: UserMini
  onPress: () => void
}

export function ChatPersonRow({ user, onPress }: Props) {
  const { t } = useTranslation()
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-3 active:bg-surface"
      accessibilityLabel={t('chat.people.chatWith', {
        name: `${user.name} ${user.lastname}`.trim(),
      })}
    >
      <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size={44} />
      <View className="flex-1">
        <Text className="text-content-bright font-semibold text-base">
          {user.name} {user.lastname}
        </Text>
        <Text className="text-content-subtle text-sm">@{user.username}</Text>
      </View>
    </Pressable>
  )
}

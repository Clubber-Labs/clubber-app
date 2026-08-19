import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ChatsIcon } from 'phosphor-react-native'
import { colors } from '@/shared/theme'

type Props = {
  onNew: () => void
}

export function InboxEmpty({ onNew }: Props) {
  const { t } = useTranslation()
  return (
    <View className="flex-1 items-center justify-center px-8 gap-3">
      <View className="w-16 h-16 rounded-full bg-surface items-center justify-center">
        <ChatsIcon size={32} color={colors.brandEmphasis} />
      </View>
      <Text className="text-content font-semibold text-base">
        {t('chat.inbox.emptyTitle')}
      </Text>
      <Text className="text-content-muted text-sm text-center">
        {t('chat.inbox.emptyBody')}
      </Text>
      <Pressable
        onPress={onNew}
        className="mt-2 bg-brand rounded-full px-5 py-2.5"
        accessibilityLabel={t('chat.inbox.start')}
      >
        <Text className="text-content font-semibold text-sm">
          {t('chat.inbox.start')}
        </Text>
      </Pressable>
    </View>
  )
}

import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { BellIcon } from 'phosphor-react-native'
import { colors } from '@/shared/theme'

export function NotificationsEmptyState() {
  const { t } = useTranslation()
  return (
    <View className="flex-1 items-center justify-center px-8 gap-3 py-24">
      <View className="w-16 h-16 rounded-2xl bg-surface border border-line items-center justify-center">
        <BellIcon size={28} color={colors.contentFaint} />
      </View>
      <Text className="text-content text-lg font-bold text-center">
        {t('notifications.emptyTitle')}
      </Text>
      <Text className="text-content-muted text-sm text-center">
        {t('notifications.emptyBody')}
      </Text>
    </View>
  )
}

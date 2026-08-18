import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'

export function AuthDivider() {
  const { t } = useTranslation()
  return (
    <View className="flex-row items-center my-6 gap-3">
      <View className="flex-1 h-px bg-surface-elevated" />
      <Text className="text-content-subtle text-sm">
        {t('auth.divider.or')}
      </Text>
      <View className="flex-1 h-px bg-surface-elevated" />
    </View>
  )
}

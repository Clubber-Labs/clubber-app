import { View, Text } from 'react-native'
import { dateSeparatorLabel } from '../utils/messageTime'
import { useLocale } from '@/shared/hooks/useLocale'

export function DateSeparator({ iso }: { iso: string }) {
  const locale = useLocale()
  return (
    <View className="items-center my-3">
      <View className="bg-surface rounded-full px-3 py-1">
        <Text className="text-xs text-content-muted font-medium">
          {dateSeparatorLabel(iso, locale)}
        </Text>
      </View>
    </View>
  )
}

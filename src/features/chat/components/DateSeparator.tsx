import { View, Text } from 'react-native'
import { dateSeparatorLabel } from '../utils/messageTime'

export function DateSeparator({ iso }: { iso: string }) {
  return (
    <View className="items-center my-3">
      <View className="bg-zinc-900 rounded-full px-3 py-1">
        <Text className="text-xs text-zinc-400 font-medium">
          {dateSeparatorLabel(iso)}
        </Text>
      </View>
    </View>
  )
}

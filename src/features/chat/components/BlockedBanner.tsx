import { View, Text } from 'react-native'

export function BlockedBanner({ message }: { message: string }) {
  return (
    <View className="px-4 py-4 border-t border-zinc-900 bg-black">
      <Text className="text-zinc-500 text-sm text-center">{message}</Text>
    </View>
  )
}

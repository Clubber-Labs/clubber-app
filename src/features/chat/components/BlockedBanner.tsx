import { View, Text } from 'react-native'

export function BlockedBanner({ message }: { message: string }) {
  return (
    <View className="px-4 py-4 border-t border-line-subtle bg-background">
      <Text className="text-content-subtle text-sm text-center">{message}</Text>
    </View>
  )
}

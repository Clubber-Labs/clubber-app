import { View, Text } from 'react-native'

export function AuthDivider() {
  return (
    <View className="flex-row items-center my-6 gap-3">
      <View className="flex-1 h-px bg-surface-elevated" />
      <Text className="text-content-subtle text-sm">Ou</Text>
      <View className="flex-1 h-px bg-surface-elevated" />
    </View>
  )
}

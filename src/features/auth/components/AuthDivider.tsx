import { View, Text } from 'react-native'

export function AuthDivider() {
  return (
    <View className="flex-row items-center my-6 gap-3">
      <View className="flex-1 h-px bg-zinc-800" />
      <Text className="text-zinc-500 text-sm">Ou</Text>
      <View className="flex-1 h-px bg-zinc-800" />
    </View>
  )
}

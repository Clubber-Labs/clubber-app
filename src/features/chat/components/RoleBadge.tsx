import { View, Text } from 'react-native'

export function RoleBadge() {
  return (
    <View className="bg-zinc-800 rounded px-1.5 py-0.5">
      <Text className="text-zinc-400 text-[10px] font-bold tracking-wide">
        ADMIN
      </Text>
    </View>
  )
}

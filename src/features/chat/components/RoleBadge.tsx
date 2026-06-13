import { View, Text } from 'react-native'

export function RoleBadge() {
  return (
    <View className="bg-surface-elevated rounded px-1.5 py-0.5">
      <Text className="text-content-muted text-[10px] font-bold tracking-wide">
        ADMIN
      </Text>
    </View>
  )
}

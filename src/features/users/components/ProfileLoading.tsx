import { View, ActivityIndicator } from 'react-native'

export function ProfileLoading() {
  return (
    <View className="flex-1 bg-black items-center justify-center">
      <ActivityIndicator color="#7c3aed" />
    </View>
  )
}

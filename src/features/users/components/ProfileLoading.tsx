import { View, ActivityIndicator } from 'react-native'
import { colors } from '@/shared/theme'

export function ProfileLoading() {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <ActivityIndicator color={colors.brand} />
    </View>
  )
}

import { View } from 'react-native'

export function InboxSkeleton() {
  return (
    <View className="pt-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} className="flex-row items-center gap-3 px-4 py-3">
          <View className="w-[52px] h-[52px] rounded-full bg-surface" />
          <View className="flex-1 gap-2">
            <View className="h-3.5 bg-surface rounded w-2/5" />
            <View className="h-3 bg-surface rounded w-3/4" />
          </View>
        </View>
      ))}
    </View>
  )
}

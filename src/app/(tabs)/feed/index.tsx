import { View } from 'react-native'
import { FeedList } from '@/features/feed/components/FeedList'

export default function FeedScreen() {
  return (
    <View className="flex-1 bg-white">
      <FeedList />
    </View>
  )
}

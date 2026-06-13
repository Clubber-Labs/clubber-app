import { View } from 'react-native'
import { FeedList } from '@/features/feed/components/FeedList'
import { FloatingCreateButton } from '@/features/events/components/FloatingCreateButton'

export default function FeedScreen() {
  return (
    <View className="flex-1 bg-background">
      <FeedList />
      <FloatingCreateButton />
    </View>
  )
}

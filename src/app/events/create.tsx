import { View } from 'react-native'
import { EventCreateForm } from '@/features/events/components/EventCreateForm'

export default function CreateEventScreen() {
  return (
    <View className="flex-1 bg-black">
      <EventCreateForm />
    </View>
  )
}

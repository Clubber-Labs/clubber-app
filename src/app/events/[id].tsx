import { View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useEvent } from '@/features/events/hooks/useEvents'

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { isLoading } = useEvent(id)

  if (isLoading) return <View className="flex-1 bg-white" />

  return <View className="flex-1 bg-white" />
}

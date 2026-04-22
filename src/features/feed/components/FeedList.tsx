import { FlatList, View, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { useFeed } from '../hooks/useFeed'
import { EventCard } from '@/features/events/components/EventCard'

export function FeedList() {
  const { data: events, isLoading, isError } = useFeed()
  const router = useRouter()

  if (isLoading) return <View className="flex-1 bg-white" />

  if (isError || !events) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Erro ao carregar o feed.</Text>
      </View>
    )
  }

  if (events.length === 0) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Nenhum evento por aqui ainda.</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={events}
      keyExtractor={item => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <EventCard
          title={item.title}
          date={item.date}
          onPress={() => router.push(`/events/${item.id}`)}
        />
      )}
    />
  )
}

import { View } from 'react-native'
import { useRouter } from 'expo-router'
import { FeedList } from '@/features/feed/components/FeedList'
import { CreateFab } from '@/shared/components/CreateFab'

export default function FeedScreen() {
  const router = useRouter()

  return (
    <View className="flex-1 bg-background">
      <FeedList />
      <CreateFab
        onCreateEvent={() => router.push('/events/create')}
        // O fluxo de rolê (sugestões por área) vive no mapa — navega até lá
        // com o pedido de abrir o painel.
        onCreateSpot={() =>
          router.push({ pathname: '/(tabs)/map', params: { suggest: '1' } })
        }
      />
    </View>
  )
}

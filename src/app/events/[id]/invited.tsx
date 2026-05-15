import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useEventInvites } from '@/features/events/hooks/useInvites'
import { UserListItem } from '@/features/users/components/UserListItem'
import { isForbiddenError } from '@/shared/lib/apiError'

export default function InvitedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: invited, isLoading, error } = useEventInvites(id)

  if (isLoading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#7c3aed" />
      </View>
    )
  }

  if (isForbiddenError(error)) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-6">
        <Text className="text-zinc-400 text-center text-sm">
          Apenas o autor do evento pode ver os convidados.
        </Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-6">
        <Text className="text-zinc-400 text-center text-sm">
          Não foi possível carregar os convidados.
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      className="flex-1 bg-black"
      data={invited ?? []}
      keyExtractor={u => u.id}
      renderItem={({ item }) => <UserListItem user={item} />}
      ItemSeparatorComponent={() => (
        <View className="h-px bg-zinc-900 ml-16" />
      )}
      ListEmptyComponent={
        <View className="items-center justify-center pt-16 px-6">
          <Text className="text-zinc-500 text-sm text-center">
            Ninguém convidado ainda.
          </Text>
        </View>
      }
    />
  )
}

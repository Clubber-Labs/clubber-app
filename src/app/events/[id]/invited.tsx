import { View, Text, FlatList, ActivityIndicator } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useEventInvites } from '@/features/events/hooks/useInvites'
import { UserListItem } from '@/features/users/components/UserListItem'
import { isForbiddenError } from '@/shared/lib/apiError'
import { colors } from '@/shared/theme'

export default function InvitedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: invited, isLoading, error } = useEventInvites(id)

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={colors.brand} />
      </View>
    )
  }

  if (isForbiddenError(error)) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-content-muted text-center text-sm">
          Apenas o autor do evento pode ver os convidados.
        </Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-content-muted text-center text-sm">
          Não foi possível carregar os convidados.
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      className="flex-1 bg-background"
      data={invited ?? []}
      keyExtractor={u => u.id}
      renderItem={({ item }) => <UserListItem user={item} />}
      ItemSeparatorComponent={() => <View className="h-px bg-surface ml-16" />}
      ListEmptyComponent={
        <View className="items-center justify-center pt-16 px-6">
          <Text className="text-content-subtle text-sm text-center">
            Ninguém convidado ainda.
          </Text>
        </View>
      }
    />
  )
}

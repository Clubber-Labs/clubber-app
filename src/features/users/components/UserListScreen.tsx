import type { ReactNode } from 'react'
import { View, Text, FlatList, ActivityIndicator } from 'react-native'
import { UserListItem } from './UserListItem'
import { isForbiddenError } from '@/shared/lib/apiError'
import type { FeedAuthor } from '@/shared/types'
import type { UseInfiniteQueryResult } from '@tanstack/react-query'
import type { CursorPaginatedResponse } from '@/shared/types'

type Props = {
  query: UseInfiniteQueryResult<
    { pages: CursorPaginatedResponse<FeedAuthor>[] },
    Error
  >
  emptyMessage: string
  renderTrailing?: (user: FeedAuthor) => ReactNode
}

export function UserListScreen({ query, emptyMessage, renderTrailing }: Props) {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = query

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
        <Text className="text-zinc-400 text-center text-base">
          Este perfil é privado.
        </Text>
        <Text className="text-zinc-500 text-center text-sm mt-1">
          Siga para ver seguidores e seguindo.
        </Text>
      </View>
    )
  }

  const users = data?.pages.flatMap(p => p.data) ?? []

  return (
    <FlatList
      className="flex-1 bg-black"
      data={users}
      keyExtractor={u => u.id}
      renderItem={({ item }) => (
        <UserListItem user={item} trailing={renderTrailing?.(item)} />
      )}
      ItemSeparatorComponent={() => <View className="h-px bg-zinc-900 ml-16" />}
      ListEmptyComponent={
        <View className="items-center justify-center pt-16">
          <Text className="text-zinc-500 text-sm">{emptyMessage}</Text>
        </View>
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator color="#7c3aed" style={{ marginVertical: 16 }} />
        ) : null
      }
      onEndReached={() => hasNextPage && fetchNextPage()}
      onEndReachedThreshold={0.3}
    />
  )
}

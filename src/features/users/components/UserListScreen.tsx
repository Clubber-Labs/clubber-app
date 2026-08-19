import type { ReactNode } from 'react'
import { View, Text, FlatList, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { UserListItem } from './UserListItem'
import { isForbiddenError } from '@/shared/lib/apiError'
import type { FeedAuthor } from '@/shared/types'
import type { UseInfiniteQueryResult } from '@tanstack/react-query'
import type { CursorPaginatedResponse } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  query: UseInfiniteQueryResult<
    { pages: CursorPaginatedResponse<FeedAuthor>[] },
    Error
  >
  emptyMessage: string
  renderTrailing?: (user: FeedAuthor) => ReactNode
}

export function UserListScreen({ query, emptyMessage, renderTrailing }: Props) {
  const { t } = useTranslation()
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
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={colors.brand} />
      </View>
    )
  }

  if (isForbiddenError(error)) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-content-muted text-center text-base">
          {t('users.list.privateTitle')}
        </Text>
        <Text className="text-content-subtle text-center text-sm mt-1">
          {t('users.list.privateMessage')}
        </Text>
      </View>
    )
  }

  const users = data?.pages.flatMap(p => p.data) ?? []

  return (
    <FlatList
      className="flex-1 bg-background"
      data={users}
      keyExtractor={u => u.id}
      renderItem={({ item }) => (
        <UserListItem user={item} trailing={renderTrailing?.(item)} />
      )}
      ItemSeparatorComponent={() => <View className="h-px bg-surface ml-16" />}
      ListEmptyComponent={
        <View className="items-center justify-center pt-16">
          <Text className="text-content-subtle text-sm">{emptyMessage}</Text>
        </View>
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator
            color={colors.brand}
            style={{ marginVertical: 16 }}
          />
        ) : null
      }
      onEndReached={() => hasNextPage && fetchNextPage()}
      onEndReachedThreshold={0.3}
    />
  )
}

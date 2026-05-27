import { useState } from 'react'
import {
  View,
  ActivityIndicator,
  FlatList,
  Pressable,
  Keyboard,
} from 'react-native'
import { useSearchUsers } from '@/features/users/hooks/useSearchUsers'
import { UserSearchInput } from '@/features/users/components/UserSearchInput'
import { UserSearchCard } from '@/features/users/components/UserSearchCard'
import { UserSearchEmpty } from '@/features/users/components/UserSearchEmpty'

export default function SearchScreen() {
  const [query, setQuery] = useState('')
  const {
    users,
    debouncedQuery,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useSearchUsers(query)

  const showIdle = debouncedQuery.length < 2
  const showSpinner = !showIdle && isLoading
  const showNoResults =
    !showIdle && !isLoading && !isError && users.length === 0

  return (
    <View className="flex-1 bg-black">
      <UserSearchInput
        value={query}
        onChange={setQuery}
        loading={!showIdle && isLoading}
      />

      {showIdle ? (
        <Pressable className="flex-1" onPress={Keyboard.dismiss}>
          <UserSearchEmpty kind="idle" />
        </Pressable>
      ) : showSpinner ? (
        <Pressable
          className="flex-1 items-center py-12"
          onPress={Keyboard.dismiss}
        >
          <ActivityIndicator color="#8b5cf6" />
        </Pressable>
      ) : showNoResults ? (
        <Pressable className="flex-1" onPress={Keyboard.dismiss}>
          <UserSearchEmpty kind="no-results" />
        </Pressable>
      ) : (
        <FlatList
          data={users}
          keyExtractor={u => u.id}
          renderItem={({ item }) => <UserSearchCard user={item} />}
          ItemSeparatorComponent={() => (
            <View className="h-px bg-zinc-900 mx-4" />
          )}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage()
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator
                color="#8b5cf6"
                style={{ marginVertical: 16 }}
              />
            ) : null
          }
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      )}
    </View>
  )
}

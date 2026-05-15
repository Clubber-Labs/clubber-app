import { useMemo, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEvent } from '@/features/events/hooks/useEvents'
import { useFollowers } from '@/features/follows/hooks/useFollowList'
import { useInviteUsers } from '@/features/events/hooks/useInvites'
import { UserListItem } from '@/features/users/components/UserListItem'
import { Button } from '@/shared/components/Button'

export default function InvitesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { data: event } = useEvent(id)
  const authorId = event?.authorId ?? ''
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useFollowers(authorId)
  const invite = useInviteUsers(id)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const followers = useMemo(
    () => data?.pages.flatMap(p => p.data) ?? [],
    [data],
  )

  function toggle(userId: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  function handleInviteSelected() {
    if (selected.size === 0) return
    invite.mutate(Array.from(selected), {
      onSuccess: () => router.replace(`/events/${id}/invited`),
    })
  }

  function handleInviteAll() {
    invite.mutate(undefined, {
      onSuccess: () => router.replace(`/events/${id}/invited`),
    })
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#7c3aed" />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-black">
      <FlatList
        data={followers}
        keyExtractor={u => u.id}
        renderItem={({ item }) => {
          const checked = selected.has(item.id)
          return (
            <Pressable onPress={() => toggle(item.id)}>
              <UserListItem
                user={item}
                trailing={
                  <Ionicons
                    name={checked ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={checked ? '#7c3aed' : '#71717a'}
                  />
                }
              />
            </Pressable>
          )
        }}
        ItemSeparatorComponent={() => (
          <View className="h-px bg-zinc-900 ml-16" />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center pt-16 px-6">
            <Text className="text-zinc-500 text-sm text-center">
              Você ainda não tem seguidores pra convidar.
            </Text>
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

      {followers.length > 0 && (
        <View className="border-t border-zinc-900 px-4 py-3 gap-2 bg-black">
          <Button
            label={
              selected.size > 0
                ? `Convidar ${selected.size} ${selected.size === 1 ? 'pessoa' : 'pessoas'}`
                : 'Selecione pessoas pra convidar'
            }
            onPress={handleInviteSelected}
            disabled={selected.size === 0 || invite.isPending}
            loading={invite.isPending && selected.size > 0}
          />
          <Pressable
            onPress={handleInviteAll}
            disabled={invite.isPending}
            className="py-2 items-center"
          >
            <Text className="text-violet-400 text-sm font-medium">
              Convidar todos os seguidores
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}

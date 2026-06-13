import { useMemo, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useEvent } from '@/features/events/hooks/useEvents'
import { useFollowers } from '@/features/follows/hooks/useFollowList'
import { useInviteUsers } from '@/features/events/hooks/useInvites'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { Button } from '@/shared/components/Button'
import { FormError } from '@/shared/components/FormError'
import type { FeedAuthor } from '@/shared/types'
import { colors } from '@/shared/theme'

type PendingAction = 'selected' | 'all' | null

export default function InvitesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const viewerId = useAuthStore(s => s.userId)
  const {
    data: event,
    isLoading: eventLoading,
    error: eventError,
  } = useEvent(id)
  const authorId = event?.authorId ?? ''
  const canInvite =
    !!event && !event.isPublic && !!viewerId && event.authorId === viewerId
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: followersLoading,
  } = useFollowers(canInvite ? authorId : '')
  const invite = useInviteUsers(id)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)

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
    setPendingAction('selected')
    invite.mutate(Array.from(selected), {
      onSuccess: () => router.replace(`/events/${id}/invited`),
      onSettled: () => setPendingAction(null),
    })
  }

  function handleInviteAll() {
    setPendingAction('all')
    invite.mutate(undefined, {
      onSuccess: () => router.replace(`/events/${id}/invited`),
      onSettled: () => setPendingAction(null),
    })
  }

  if (eventLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={colors.brand} />
      </View>
    )
  }

  if (eventError || !event) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-content-muted text-center text-sm">
          Não foi possível carregar o evento.
        </Text>
      </View>
    )
  }

  // Gate em render: convite só faz sentido pra autor em evento privado.
  // Backend já bloqueia o POST, mas evitamos a UI inconsistente.
  if (!canInvite) {
    return <Redirect href={`/events/${id}`} />
  }

  if (followersLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={colors.brand} />
      </View>
    )
  }

  const submitError = invite.error
    ? 'Não foi possível convidar. Tente novamente.'
    : null

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={followers}
        keyExtractor={u => u.id}
        renderItem={({ item }) => (
          <FollowerRow
            user={item}
            checked={selected.has(item.id)}
            onToggle={() => toggle(item.id)}
          />
        )}
        ItemSeparatorComponent={() => (
          <View className="h-px bg-surface ml-16" />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center pt-16 px-6">
            <Text className="text-content-subtle text-sm text-center">
              Você ainda não tem seguidores pra convidar.
            </Text>
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

      {followers.length > 0 && (
        <View className="border-t border-line-subtle px-4 py-3 gap-2 bg-background">
          <FormError message={submitError} />
          <Button
            label={
              selected.size > 0
                ? `Convidar ${selected.size} ${selected.size === 1 ? 'pessoa' : 'pessoas'}`
                : 'Selecione pessoas pra convidar'
            }
            onPress={handleInviteSelected}
            disabled={selected.size === 0 || invite.isPending}
            loading={pendingAction === 'selected'}
          />
          <Pressable
            onPress={handleInviteAll}
            disabled={invite.isPending}
            className="py-2 items-center flex-row justify-center gap-2"
          >
            {pendingAction === 'all' && (
              <ActivityIndicator color={colors.brandText} size="small" />
            )}
            <Text className="text-brand-text text-sm font-medium">
              Convidar todos os seguidores
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}

type RowProps = {
  user: FeedAuthor
  checked: boolean
  onToggle: () => void
}

function FollowerRow({ user, checked, onToggle }: RowProps) {
  const fullName = `${user.name} ${user.lastname}`.trim()
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center gap-3 px-4 py-3"
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={fullName}
    >
      <UserAvatar name={fullName} avatarUrl={user.avatarUrl} size={44} />
      <View className="flex-1">
        <Text className="text-content font-semibold text-sm">{fullName}</Text>
        <Text className="text-content-muted text-xs">@{user.username}</Text>
      </View>
      <Ionicons
        name={checked ? 'checkbox' : 'square-outline'}
        size={22}
        color={checked ? colors.brand : colors.contentSubtle}
      />
    </Pressable>
  )
}

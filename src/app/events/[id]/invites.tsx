import { useMemo, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { CheckSquareIcon, SquareIcon } from 'phosphor-react-native'
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
  const { t } = useTranslation()
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
          {t('events.detail.loadError')}
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

  const submitError = invite.error ? t('events.invites.error') : null

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
              {t('events.invites.noFollowers')}
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
                ? t('events.invites.inviteCount', { count: selected.size })
                : t('events.invites.selectPrompt')
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
              {t('events.invites.inviteAll')}
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
      {checked ? (
        <CheckSquareIcon weight="fill" size={22} color={colors.brand} />
      ) : (
        <SquareIcon size={22} color={colors.contentSubtle} />
      )}
    </Pressable>
  )
}

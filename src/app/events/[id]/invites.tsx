import { useMemo, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useEvent } from '@/features/events/hooks/useEvents'
import {
  useFollowers,
  useFollowing,
} from '@/features/follows/hooks/useFollowList'
import { useSearchUsers } from '@/features/users/hooks/useSearchUsers'
import {
  useEventInvites,
  useInviteUsers,
} from '@/features/events/hooks/useInvites'
import {
  InviteUserRow,
  type InviteCandidate,
} from '@/features/events/components/invites/InviteUserRow'
import { Chip } from '@/shared/components/Chip'
import { SearchInput } from '@/shared/components/SearchInput'
import { Button } from '@/shared/components/Button'
import { FormError } from '@/shared/components/FormError'
import { colors } from '@/shared/theme'

type InviteSource = 'followers' | 'following' | 'search'
type PendingAction = 'selected' | 'all' | null

type ActiveList = {
  users: InviteCandidate[]
  loading: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}

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
  // Privado: só o autor convida (convite materializa acesso). Público:
  // qualquer usuário logado convida (convite é divulgação) — a elegibilidade
  // de quem pode ser convidado (perfil privado exige follow mútuo) é do
  // backend. Evento encerrado/cancelado não convida (mesma janela do RSVP) —
  // a tela também abre por deep link, então o gate não pode confiar só no
  // card do detalhe.
  const inviteWindowOpen =
    !!event && event.status !== 'PAST' && event.status !== 'CANCELED'
  const canInvite =
    !!event &&
    !!viewerId &&
    inviteWindowOpen &&
    (event.authorId === viewerId || event.isPublic)

  const [source, setSource] = useState<InviteSource>('followers')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)

  // As redes listadas são as de QUEM convida — pro autor dá no mesmo; pro
  // convidador de evento público, são os seguidores/seguindo dele.
  const followersQ = useFollowers(canInvite && viewerId ? viewerId : '')
  const followingQ = useFollowing(canInvite && viewerId ? viewerId : '')
  const searchQ = useSearchUsers(canInvite ? query : '')
  // A lista de convidados é author-only no backend — pro convidador comum nem
  // consulta (seria 403 certo); as linhas dele só não ganham o selo.
  const isAuthor = !!event && event.authorId === viewerId
  const { data: eventInvites } = useEventInvites(
    canInvite && isAuthor ? id : '',
  )
  const invite = useInviteUsers(id)

  const invitedIds = useMemo(
    () => new Set((eventInvites ?? []).map(u => u.id)),
    [eventInvites],
  )
  // O autor do evento não se convida — e pode aparecer em qualquer origem
  // (na rede de um convidador não-autor ou na busca).
  const eventAuthorId = event?.authorId
  const followerUsers = useMemo(
    () =>
      (followersQ.data?.pages.flatMap(p => p.data) ?? []).filter(
        u => u.id !== eventAuthorId,
      ),
    [followersQ.data, eventAuthorId],
  )
  const followingUsers = useMemo(
    () =>
      (followingQ.data?.pages.flatMap(p => p.data) ?? []).filter(
        u => u.id !== eventAuthorId,
      ),
    [followingQ.data, eventAuthorId],
  )
  const searchResults = useMemo(
    () =>
      searchQ.users.filter(u => u.id !== viewerId && u.id !== eventAuthorId),
    [searchQ.users, viewerId, eventAuthorId],
  )

  function toggle(userId: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  // Autor cai na lista de convidados; convidador comum volta pro evento (a
  // lista é author-only — seria um 403 na cara de quem acabou de convidar).
  function finishInvite() {
    if (isAuthor) router.replace(`/events/${id}/invited`)
    else router.back()
  }

  function handleInviteSelected() {
    if (selected.size === 0) return
    setPendingAction('selected')
    invite.mutate(Array.from(selected), {
      onSuccess: finishInvite,
      onSettled: () => setPendingAction(null),
    })
  }

  function handleInviteAll() {
    setPendingAction('all')
    invite.mutate(undefined, {
      onSuccess: finishInvite,
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

  // Gate em render: espelha a regra acima. Backend já bloqueia o POST, mas
  // evitamos a UI inconsistente.
  if (!canInvite) {
    return <Redirect href={`/events/${id}`} />
  }

  const active: ActiveList =
    source === 'followers'
      ? {
          users: followerUsers,
          loading: followersQ.isLoading,
          hasNextPage: !!followersQ.hasNextPage,
          isFetchingNextPage: followersQ.isFetchingNextPage,
          fetchNextPage: followersQ.fetchNextPage,
        }
      : source === 'following'
        ? {
            users: followingUsers,
            loading: followingQ.isLoading,
            hasNextPage: !!followingQ.hasNextPage,
            isFetchingNextPage: followingQ.isFetchingNextPage,
            fetchNextPage: followingQ.fetchNextPage,
          }
        : {
            users: searchResults,
            loading: searchQ.isLoading,
            hasNextPage: !!searchQ.hasNextPage,
            isFetchingNextPage: searchQ.isFetchingNextPage,
            fetchNextPage: searchQ.fetchNextPage,
          }

  const emptyMessage =
    source === 'followers'
      ? t('events.invites.noFollowers')
      : source === 'following'
        ? t('events.invites.noFollowing')
        : searchQ.debouncedQuery.length < 2
          ? t('events.invites.searchHint')
          : t('events.invites.noResults')

  const submitError = invite.error ? t('events.invites.error') : null

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row gap-2 px-4 pt-2 pb-3">
        <Chip
          label={t('events.invites.tabFollowers')}
          active={source === 'followers'}
          onPress={() => setSource('followers')}
        />
        <Chip
          label={t('events.invites.tabFollowing')}
          active={source === 'following'}
          onPress={() => setSource('following')}
        />
        <Chip
          label={t('events.invites.tabSearch')}
          active={source === 'search'}
          onPress={() => setSource('search')}
        />
      </View>

      {source === 'search' && (
        <View className="px-4 pb-3">
          <SearchInput
            value={query}
            onChange={setQuery}
            loading={searchQ.debouncedQuery.length >= 2 && searchQ.isLoading}
            placeholder={t('events.invites.searchPlaceholder')}
          />
        </View>
      )}

      {active.loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : (
        <FlatList
          data={active.users}
          keyExtractor={u => u.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <InviteUserRow
              user={item}
              checked={selected.has(item.id)}
              invited={invitedIds.has(item.id)}
              onToggle={() => toggle(item.id)}
            />
          )}
          ItemSeparatorComponent={() => (
            <View className="h-px bg-surface ml-16" />
          )}
          ListEmptyComponent={
            <View className="items-center justify-center pt-16 px-6">
              <Text className="text-content-subtle text-sm text-center">
                {emptyMessage}
              </Text>
            </View>
          }
          ListFooterComponent={
            active.isFetchingNextPage ? (
              <ActivityIndicator
                color={colors.brand}
                style={{ marginVertical: 16 }}
              />
            ) : null
          }
          onEndReached={() => active.hasNextPage && active.fetchNextPage()}
          onEndReachedThreshold={0.3}
        />
      )}

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
        {source === 'followers' && followerUsers.length > 0 && (
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
        )}
      </View>
    </View>
  )
}

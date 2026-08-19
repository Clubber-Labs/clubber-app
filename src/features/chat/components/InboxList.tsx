import { useRef } from 'react'
import { TrashIcon } from 'phosphor-react-native'
import {
  FlatList,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { useInbox } from '../hooks/useInbox'
import { useDeleteConversation } from '../hooks/useDeleteConversation'
import { usePullRefresh } from '@/shared/hooks/usePullRefresh'
import { useActiveTabPress } from '@/shared/hooks/useActiveTabPress'
import { useTabBarClearance } from '@/shared/hooks/useTabBarClearance'
import { useConfirm } from '@/shared/lib/confirm'
import { SwipeableRow } from '@/shared/components/SwipeableRow'
import { ConversationRow } from './ConversationRow'
import { InboxSkeleton } from './InboxSkeleton'
import { InboxEmpty } from './InboxEmpty'
import type { InboxItem } from '../types'
import { colors } from '@/shared/theme'

type Props = {
  myId: string
  onOpen: (id: string) => void
  onNew: () => void
}

export function InboxList({ myId, onOpen, onNew }: Props) {
  const { t } = useTranslation()
  const tabBarClearance = useTabBarClearance()

  // Re-tap na aba Mensagens: volta ao topo da caixa de entrada.
  const listRef = useRef<FlatList<InboxItem>>(null)
  useActiveTabPress(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true })
  })
  const {
    conversations,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInbox()
  const { refreshing, onRefresh } = usePullRefresh(refetch)
  const confirm = useConfirm()
  const del = useDeleteConversation()

  async function askDelete(item: InboxItem) {
    const ok = await confirm({
      title: t('chat.inbox.deleteTitle'),
      message: t('chat.inbox.deleteMessage'),
      confirmLabel: t('chat.inbox.delete'),
      destructive: true,
    })
    if (ok) del.mutate(item.id)
  }

  if (isLoading) return <InboxSkeleton />

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center px-8 gap-3">
        <Text className="text-content-muted text-center">
          {t('chat.inbox.loadError')}
        </Text>
        <Pressable
          onPress={() => refetch()}
          className="border border-line-strong rounded-full px-5 py-2"
        >
          <Text className="text-brand-text font-medium text-sm">
            {t('common.retry')}
          </Text>
        </Pressable>
      </View>
    )
  }

  if (conversations.length === 0) return <InboxEmpty onNew={onNew} />

  return (
    <FlatList
      ref={listRef}
      data={conversations}
      keyExtractor={(item: InboxItem) => item.id}
      contentContainerStyle={{ paddingBottom: tabBarClearance }}
      renderItem={({ item }) => (
        <SwipeableRow
          rightActions={[
            {
              icon: TrashIcon,
              label: t('chat.inbox.delete'),
              onPress: () => askDelete(item),
            },
          ]}
        >
          <ConversationRow
            item={item}
            myId={myId}
            onPress={() => onOpen(item.id)}
          />
        </SwipeableRow>
      )}
      ItemSeparatorComponent={() => <View className="h-px bg-surface ml-20" />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.brandEmphasis}
        />
      }
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage()
      }}
      onEndReachedThreshold={0.4}
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator
            size="small"
            color={colors.brandEmphasis}
            className="py-4"
          />
        ) : null
      }
    />
  )
}

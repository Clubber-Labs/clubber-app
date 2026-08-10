import { useMemo } from 'react'
import {
  View,
  Text,
  SectionList,
  Pressable,
  RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { CaretLeftIcon, GearIcon } from 'phosphor-react-native'
import { usePullRefresh } from '@/shared/hooks/usePullRefresh'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { useUnreadCount } from '@/features/notifications/hooks/useUnreadCount'
import { useMarkAllRead } from '@/features/notifications/hooks/useMarkRead'
import { useOpenNotification } from '@/features/notifications/hooks/useOpenNotification'
import { NotificationRow } from '@/features/notifications/components/NotificationRow'
import { NotificationsEmptyState } from '@/features/notifications/components/NotificationsEmptyState'
import { groupNotificationsByDay } from '@/features/notifications/utils/groupNotificationsByDay'
import { colors } from '@/shared/theme'

export default function NotificationsScreen() {
  const router = useRouter()
  const {
    notifications,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotifications()
  const { count } = useUnreadCount()
  const markAllRead = useMarkAllRead()
  const { openNotification } = useOpenNotification()
  const { refreshing, onRefresh } = usePullRefresh(refetch)

  const sections = useMemo(
    () => groupNotificationsByDay(notifications),
    [notifications],
  )

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-2 pt-2 pb-3">
        <View className="flex-1 flex-row items-center gap-1">
          <Pressable
            onPress={() => router.back()}
            className="w-9 h-9 items-center justify-center"
            accessibilityLabel="Voltar"
          >
            <CaretLeftIcon size={26} color={colors.contentBright} />
          </Pressable>
          <Text className="text-content text-xl font-extrabold">
            Notificações
          </Text>
        </View>
        <View className="flex-row items-center gap-1 pr-2">
          {count > 0 && (
            <Pressable
              onPress={() => markAllRead.mutate()}
              className="px-2 py-1.5"
            >
              <Text className="text-brand-text text-[13px] font-bold">
                Marcar lidas
              </Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => router.push('/settings/notifications')}
            className="w-9 h-9 items-center justify-center"
            accessibilityLabel="Configurações de notificações"
          >
            <GearIcon size={20} color={colors.contentSecondary} />
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 bg-background" />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <NotificationRow notification={item} onPress={openNotification} />
          )}
          renderSectionHeader={({ section }) => (
            <Text className="text-content-subtle bg-background text-[11px] font-bold uppercase tracking-wider px-4 pt-4 pb-2">
              {section.title}
            </Text>
          )}
          stickySectionHeadersEnabled={false}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage()
          }}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.brandText}
            />
          }
          ListEmptyComponent={<NotificationsEmptyState />}
          contentContainerStyle={
            sections.length === 0 ? { flexGrow: 1 } : undefined
          }
        />
      )}
    </View>
  )
}

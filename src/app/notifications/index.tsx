import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { usePullRefresh } from '@/shared/hooks/usePullRefresh'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { useUnreadCount } from '@/features/notifications/hooks/useUnreadCount'
import { useMarkAllRead } from '@/features/notifications/hooks/useMarkRead'
import { useOpenNotification } from '@/features/notifications/hooks/useOpenNotification'
import { NotificationRow } from '@/features/notifications/components/NotificationRow'
import { NotificationsEmptyState } from '@/features/notifications/components/NotificationsEmptyState'

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

  return (
    <View className="flex-1 bg-black">
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-xl font-bold text-white">Notificações</Text>
        <View className="flex-row items-center gap-1">
          {count > 0 && (
            <Pressable
              onPress={() => markAllRead.mutate()}
              className="px-3 py-1.5"
            >
              <Text className="text-violet-400 text-sm font-semibold">
                Marcar todas como lidas
              </Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => router.push('/settings/notifications')}
            className="w-9 h-9 items-center justify-center"
            accessibilityLabel="Configurações de notificações"
          >
            <Ionicons name="settings-outline" size={20} color="#e5e7eb" />
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 bg-black" />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <NotificationRow notification={item} onPress={openNotification} />
          )}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage()
          }}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#a78bfa"
            />
          }
          ListEmptyComponent={<NotificationsEmptyState />}
          contentContainerStyle={
            notifications.length === 0 ? { flexGrow: 1 } : undefined
          }
        />
      )}
    </View>
  )
}

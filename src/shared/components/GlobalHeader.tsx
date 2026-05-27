import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useSegments } from 'expo-router'
import { useProfileDrawer } from '@/features/users/store/profileDrawerStore'
import { useFollowRequests } from '@/features/follows/hooks/useFollowRequests'

type Props = {
  showNotifications?: boolean
  showMessages?: boolean
  showBack?: boolean
  onNotificationsPress?: () => void
  onMessagesPress?: () => void
  onBackPress?: () => void
}

export function GlobalHeader({
  showNotifications = true,
  showMessages = true,
  showBack = true,
  onNotificationsPress,
  onMessagesPress,
  onBackPress,
}: Props) {
  const router = useRouter()
  const segments = useSegments()
  const setDrawerOpen = useProfileDrawer(s => s.setOpen)

  const isTabsRoot = segments[0] === '(tabs)' && segments.length <= 2
  const isProfileTab = segments.includes('profile') && isTabsRoot
  const canGoBack = showBack && !isTabsRoot

  // Habilita só quando o hambúrguer aparece — evita request extra nas outras
  // tabs. Cache do TanStack Query absorve o custo entre visitas.
  const { data: requestsData } = useFollowRequests(isProfileTab)
  const hasPendingRequests = (requestsData?.pages[0]?.data.length ?? 0) > 0

  function handleBack() {
    if (onBackPress) return onBackPress()
    router.back()
  }

  return (
    <View className="bg-black border-b border-zinc-900 px-4 py-3 flex-row items-center justify-center relative">
      <View className="absolute left-4 top-0 bottom-0 flex-row items-center">
        {canGoBack && (
          <Pressable
            onPress={handleBack}
            className="w-9 h-9 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={26} color="#f4f4f5" />
          </Pressable>
        )}
        {isProfileTab && (
          <Pressable
            onPress={() => setDrawerOpen(true)}
            className="w-9 h-9 items-center justify-center"
            accessibilityLabel={
              hasPendingRequests
                ? 'Abrir menu (solicitações pendentes)'
                : 'Abrir menu'
            }
          >
            <Ionicons name="menu" size={26} color="#f4f4f5" />
            {hasPendingRequests && (
              <View className="absolute top-1.5 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </Pressable>
        )}
      </View>

      <View className="flex-row items-center gap-2">
        <View className="w-8 h-8 rounded-full bg-violet-600 items-center justify-center">
          <Text className="text-white font-bold text-sm">C</Text>
        </View>
        <Text className="text-xl font-bold text-white">ConnectAI</Text>
      </View>

      <View className="absolute right-4 top-0 bottom-0 flex-row items-center gap-2">
        {showNotifications && (
          <Pressable
            onPress={onNotificationsPress}
            className="w-9 h-9 items-center justify-center"
          >
            <Ionicons name="notifications-outline" size={24} color="#e5e7eb" />
            <View className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Pressable>
        )}

        {showMessages && (
          <Pressable
            onPress={onMessagesPress}
            className="w-9 h-9 items-center justify-center"
          >
            <Ionicons name="mail-outline" size={24} color="#e5e7eb" />
          </Pressable>
        )}
      </View>
    </View>
  )
}

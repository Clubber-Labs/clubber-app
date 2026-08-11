import { View, Pressable } from 'react-native'
import {
  CaretLeftIcon,
  ListIcon,
  BellIcon,
  SlidersHorizontalIcon,
} from 'phosphor-react-native'
import { useRouter, useSegments } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useProfileDrawer } from '@/features/users/store/profileDrawerStore'
import { useFollowRequests } from '@/features/follows/hooks/useFollowRequests'
import { useMapUiStore } from '@/features/map/store/mapUiStore'
import { isDefaultMapFilters } from '@/features/map/types'
import { useUnreadCount } from '@/features/notifications/hooks/useUnreadCount'
import { UnreadBadge } from './UnreadBadge'
import { GlassSurface } from './GlassSurface'
import { BrandWordmark } from './brand'
import { colors } from '@/shared/theme'

// Altura da faixa útil do header (sem o inset da status bar) — base do
// useHeaderClearance nas telas em que ele flutua.
export const HEADER_BAR_HEIGHT = 56

type Props = {
  showNotifications?: boolean
  showBack?: boolean
  // true nas abas: o header flutua edge-to-edge (cobre a status bar) e o
  // conteúdo passa por baixo do vidro. false (stack): fica no fluxo, com o
  // inset do topo por conta do SafeAreaView do layout.
  floating?: boolean
  onNotificationsPress?: () => void
  onBackPress?: () => void
}

export function GlobalHeader({
  showNotifications = true,
  showBack = true,
  floating = false,
  onNotificationsPress,
  onBackPress,
}: Props) {
  const router = useRouter()
  const segments = useSegments()
  const insets = useSafeAreaInsets()
  const toggleDrawer = useProfileDrawer(s => s.toggle)
  const { count: unreadNotifications } = useUnreadCount()

  const isTabsRoot = segments[0] === '(tabs)' && segments.length <= 2
  const isProfileTab = segments.includes('profile') && isTabsRoot
  const isMapTab = segments.includes('map') && isTabsRoot
  const canGoBack = showBack && !isTabsRoot

  const setMapFiltersOpen = useMapUiStore(s => s.setFiltersOpen)
  const hasMapFilters = useMapUiStore(s => !isDefaultMapFilters(s.filters))

  // Habilita só quando o hambúrguer aparece — evita request extra nas outras
  // tabs. Cache do TanStack Query absorve o custo entre visitas.
  const { data: requestsData } = useFollowRequests(isProfileTab)
  const hasPendingRequests = (requestsData?.pages[0]?.data.length ?? 0) > 0

  function handleBack() {
    if (onBackPress) return onBackPress()
    router.back()
  }

  function handleNotifications() {
    if (onNotificationsPress) return onNotificationsPress()
    router.push('/notifications')
  }

  const bar = (
    <View
      className="px-4 flex-row items-center justify-center relative"
      style={{ height: HEADER_BAR_HEIGHT }}
    >
      <View className="absolute left-4 top-0 bottom-0 flex-row items-center">
        {canGoBack && (
          <Pressable
            onPress={handleBack}
            className="w-9 h-9 items-center justify-center"
          >
            <CaretLeftIcon size={26} color={colors.contentBright} />
          </Pressable>
        )}
        {isProfileTab && (
          <Pressable
            onPress={toggleDrawer}
            className="w-9 h-9 items-center justify-center"
            accessibilityLabel={
              hasPendingRequests
                ? 'Abrir menu (solicitações pendentes)'
                : 'Abrir menu'
            }
          >
            <ListIcon size={26} color={colors.contentBright} />
            {hasPendingRequests && (
              <View className="absolute top-1.5 right-1 w-2 h-2 bg-danger rounded-full" />
            )}
          </Pressable>
        )}
        {isMapTab && (
          <Pressable
            onPress={() => setMapFiltersOpen(true)}
            className="w-9 h-9 items-center justify-center"
            accessibilityLabel="Filtrar eventos"
          >
            <SlidersHorizontalIcon size={24} color={colors.contentBright} />
            {hasMapFilters && (
              <View className="absolute top-1.5 right-1 w-2 h-2 bg-brand-emphasis rounded-full" />
            )}
          </Pressable>
        )}
      </View>

      <BrandWordmark height={24} />

      <View className="absolute right-4 top-0 bottom-0 flex-row items-center gap-2">
        {showNotifications && (
          <Pressable
            onPress={handleNotifications}
            className="w-9 h-9 items-center justify-center"
            accessibilityLabel={
              unreadNotifications > 0
                ? `Notificações (${unreadNotifications} não lidas)`
                : 'Notificações'
            }
          >
            <BellIcon size={24} color={colors.contentSecondary} />
            {unreadNotifications > 0 && (
              <View className="absolute -top-0.5 -right-1.5">
                <UnreadBadge count={unreadNotifications} />
              </View>
            )}
          </Pressable>
        )}
      </View>
    </View>
  )

  // Sem conteúdo passando por baixo (telas empilhadas, header no fluxo), o
  // blur não tem o que desfocar e vira uma placa cinza — barra sólida.
  if (!floating) {
    return (
      <View className="bg-background border-b border-line-subtle">{bar}</View>
    )
  }

  return (
    <GlassSurface
      style={{
        paddingTop: insets.top,
        // Faixa contínua: sem bordas laterais/topo, só o hairline de baixo.
        borderWidth: 0,
        borderBottomWidth: 1,
      }}
    >
      {bar}
    </GlassSurface>
  )
}

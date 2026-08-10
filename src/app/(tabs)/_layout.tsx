import { Tabs } from 'expo-router'
import {
  HouseIcon,
  MagnifyingGlassIcon,
  MapTrifoldIcon,
  ChatCircleIcon,
  UserIcon,
} from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import { useInbox } from '@/features/chat/hooks/useInbox'
import { GlassTabBar } from '@/shared/components/GlassTabBar'

type TabConfig = {
  name: string
  title: string
  icon: Icon
}

const TABS: TabConfig[] = [
  { name: 'feed/index', title: 'Feed', icon: HouseIcon },
  {
    name: 'search/index',
    title: 'Buscar',
    icon: MagnifyingGlassIcon,
  },
  { name: 'map/index', title: 'Mapa', icon: MapTrifoldIcon },
  {
    name: 'messages/index',
    title: 'Mensagens',
    icon: ChatCircleIcon,
  },
  { name: 'profile/index', title: 'Perfil', icon: UserIcon },
]

export default function TabsLayout() {
  // Mantém o badge de não-lidas vivo enquanto a shell autenticada está montada;
  // o cache é atualizado em tempo real pelo socket (useChatRealtime).
  const { unreadTotal } = useInbox()

  return (
    <Tabs
      tabBar={props => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {TABS.map(tab => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color, size }) => (
              <tab.icon
                size={size}
                color={color}
                weight={focused ? 'fill' : 'regular'}
              />
            ),
            ...(tab.name === 'messages/index' && unreadTotal > 0
              ? { tabBarBadge: unreadTotal > 99 ? '99+' : unreadTotal }
              : {}),
          }}
        />
      ))}
    </Tabs>
  )
}

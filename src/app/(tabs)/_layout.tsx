import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'
import { useInbox } from '@/features/chat/hooks/useInbox'
import { GlassTabBar } from '@/shared/components/GlassTabBar'

type IconName = ComponentProps<typeof Ionicons>['name']

type TabConfig = {
  name: string
  title: string
  icon: IconName
  iconFocused: IconName
}

const TABS: TabConfig[] = [
  {
    name: 'feed/index',
    title: 'Feed',
    icon: 'home-outline',
    iconFocused: 'home',
  },
  {
    name: 'search/index',
    title: 'Buscar',
    icon: 'search-outline',
    iconFocused: 'search',
  },
  { name: 'map/index', title: 'Mapa', icon: 'map-outline', iconFocused: 'map' },
  {
    name: 'messages/index',
    title: 'Mensagens',
    icon: 'chatbubble-outline',
    iconFocused: 'chatbubble',
  },
  {
    name: 'profile/index',
    title: 'Perfil',
    icon: 'person-outline',
    iconFocused: 'person',
  },
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
              <Ionicons
                name={focused ? tab.iconFocused : tab.icon}
                size={size}
                color={color}
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

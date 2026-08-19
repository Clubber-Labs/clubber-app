import { Tabs } from 'expo-router'
import { useTranslation } from 'react-i18next'
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

// Mapa é a home da shell autenticada: é onde todo caminho de entrada aterrissa
// e pra onde o back do Android volta. A ordem da barra segue o array TABS.
export const unstable_settings = { anchor: 'map/index' }

type TabConfig = {
  name: string
  // Chave do dicionário: frase pronta na constante congelaria o idioma no boot.
  titleKey: `tabs.${'feed' | 'search' | 'map' | 'messages' | 'profile'}`
  icon: Icon
}

const TABS: TabConfig[] = [
  { name: 'feed/index', titleKey: 'tabs.feed', icon: HouseIcon },
  {
    name: 'search/index',
    titleKey: 'tabs.search',
    icon: MagnifyingGlassIcon,
  },
  { name: 'map/index', titleKey: 'tabs.map', icon: MapTrifoldIcon },
  {
    name: 'messages/index',
    titleKey: 'tabs.messages',
    icon: ChatCircleIcon,
  },
  { name: 'profile/index', titleKey: 'tabs.profile', icon: UserIcon },
]

export default function TabsLayout() {
  const { t } = useTranslation()
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
            title: t(tab.titleKey),
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

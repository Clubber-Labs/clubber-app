import {
  NativeTabs,
  Icon,
  Label,
  Badge,
  VectorIcon,
} from 'expo-router/unstable-native-tabs'
import { Ionicons } from '@expo/vector-icons'
import { useInbox } from '@/features/chat/hooks/useInbox'
import { colors } from '@/shared/theme'

// SF Symbols no iOS (cápsula Liquid Glass do sistema no iOS 26+); Ionicons
// rasterizados via VectorIcon no Android (bottom nav material).
const TABS = [
  {
    name: 'feed/index',
    title: 'Feed',
    sf: { default: 'house', selected: 'house.fill' },
    ion: { default: 'home-outline', selected: 'home' },
  },
  {
    name: 'search/index',
    title: 'Buscar',
    sf: { default: 'magnifyingglass', selected: 'magnifyingglass' },
    ion: { default: 'search-outline', selected: 'search' },
  },
  {
    name: 'map/index',
    title: 'Mapa',
    sf: { default: 'map', selected: 'map.fill' },
    ion: { default: 'map-outline', selected: 'map' },
  },
  {
    name: 'messages/index',
    title: 'Mensagens',
    sf: { default: 'message', selected: 'message.fill' },
    ion: { default: 'chatbubble-outline', selected: 'chatbubble' },
  },
  {
    name: 'profile/index',
    title: 'Perfil',
    sf: { default: 'person', selected: 'person.fill' },
    ion: { default: 'person-outline', selected: 'person' },
  },
] as const

export default function TabsLayout() {
  // Mantém o badge de não-lidas vivo enquanto a shell autenticada está montada;
  // o cache é atualizado em tempo real pelo socket (useChatRealtime).
  const { unreadTotal } = useInbox()

  return (
    <NativeTabs tintColor={colors.content} badgeBackgroundColor={colors.danger}>
      {TABS.map(tab => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          {/* Ícones sem rótulo, como no design anterior; o texto segue
              disponível pra acessibilidade. */}
          <Label hidden>{tab.title}</Label>
          <Icon
            sf={tab.sf}
            androidSrc={{
              default: <VectorIcon family={Ionicons} name={tab.ion.default} />,
              selected: (
                <VectorIcon family={Ionicons} name={tab.ion.selected} />
              ),
            }}
          />
          {tab.name === 'messages/index' && unreadTotal > 0 && (
            <Badge>{unreadTotal > 99 ? '99+' : String(unreadTotal)}</Badge>
          )}
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  )
}

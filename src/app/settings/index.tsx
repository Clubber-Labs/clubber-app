import { ScrollView, View, Text } from 'react-native'
import { useRouter } from 'expo-router'
import {
  UserCircleIcon,
  BellIcon,
  SparkleIcon,
  ShieldCheckIcon,
  InfoIcon,
} from 'phosphor-react-native'
import { SettingsRow } from '@/shared/components/SettingsRow'

export default function SettingsScreen() {
  const router = useRouter()

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-4 pt-6 pb-4 border-b border-line">
        <Text className="text-xl font-bold text-content">Configurações</Text>
      </View>

      <View className="mt-2">
        <SettingsRow
          label="Conta"
          description="Propriedade e controle da conta"
          icon={UserCircleIcon}
          onPress={() => router.push('/settings/account')}
        />
        <SettingsRow
          label="Notificações"
          description="Push, eventos próximos e categorias preferidas"
          icon={BellIcon}
          onPress={() => router.push('/settings/notifications')}
        />
        <SettingsRow
          label="Sugestões de rolês"
          description="Raio da busca de spots no mapa"
          icon={SparkleIcon}
          onPress={() => router.push('/settings/spots')}
        />
        <SettingsRow
          label="Privacidade"
          description="Consentimentos e dados (LGPD)"
          icon={ShieldCheckIcon}
          onPress={() => router.push('/profile/privacy')}
        />
        <SettingsRow
          label="Sobre o app"
          icon={InfoIcon}
          onPress={() => router.push('/about')}
        />
      </View>
    </ScrollView>
  )
}

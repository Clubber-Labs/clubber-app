import { ScrollView, View, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { SettingsRow } from '@/shared/components/SettingsRow'

export default function SettingsScreen() {
  const router = useRouter()

  return (
    <ScrollView
      className="flex-1 bg-black"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-4 pt-6 pb-4 border-b border-zinc-800">
        <Text className="text-xl font-bold text-white">Configurações</Text>
      </View>

      <View className="mt-2">
        <SettingsRow
          label="Conta"
          description="Propriedade e controle da conta"
          icon="person-circle-outline"
          onPress={() => router.push('/settings/account')}
        />
        <SettingsRow
          label="Privacidade"
          description="Consentimentos e dados (LGPD)"
          icon="shield-checkmark-outline"
          onPress={() => router.push('/profile/privacy')}
        />
        <SettingsRow
          label="Sobre o app"
          icon="information-circle-outline"
          onPress={() => router.push('/about')}
        />
      </View>
    </ScrollView>
  )
}

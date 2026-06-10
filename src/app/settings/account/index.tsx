import { ScrollView, View, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { SettingsRow } from '@/shared/components/SettingsRow'

export default function AccountControlScreen() {
  const router = useRouter()

  return (
    <ScrollView
      className="flex-1 bg-black"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-4 pt-6 pb-4 border-b border-zinc-800">
        <Text className="text-xl font-bold text-white">
          Propriedade e controle da conta
        </Text>
        <Text className="text-zinc-400 text-sm mt-1 leading-5">
          Desative temporariamente ou exclua sua conta de forma permanente.
        </Text>
      </View>

      <View className="mt-2">
        <SettingsRow
          label="Desativar conta"
          description="Oculta seu perfil; você volta quando quiser"
          icon="pause-circle-outline"
          onPress={() => router.push('/settings/account/deactivate')}
        />
        <SettingsRow
          label="Excluir conta"
          description="Agenda a remoção definitiva (30 dias para cancelar)"
          icon="trash-outline"
          destructive
          onPress={() => router.push('/settings/account/delete')}
        />
      </View>
    </ScrollView>
  )
}

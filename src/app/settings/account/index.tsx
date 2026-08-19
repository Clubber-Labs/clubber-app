import { ScrollView, View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { PauseCircleIcon, TrashIcon } from 'phosphor-react-native'
import { SettingsRow } from '@/shared/components/SettingsRow'

export default function AccountControlScreen() {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-4 pt-6 pb-4 border-b border-line">
        <Text className="text-xl font-bold text-content">
          {t('account.title')}
        </Text>
        <Text className="text-content-muted text-sm mt-1 leading-5">
          {t('account.subtitle')}
        </Text>
      </View>

      <View className="mt-2">
        <SettingsRow
          label={t('account.deactivate')}
          description={t('account.deactivateHint')}
          icon={PauseCircleIcon}
          onPress={() => router.push('/settings/account/deactivate')}
        />
        <SettingsRow
          label={t('account.delete')}
          description={t('account.deleteHint')}
          icon={TrashIcon}
          destructive
          onPress={() => router.push('/settings/account/delete')}
        />
      </View>
    </ScrollView>
  )
}

import { ScrollView, View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
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
          {t('settings.title')}
        </Text>
      </View>

      <View className="mt-2">
        <SettingsRow
          label={t('settings.account')}
          description={t('settings.accountHint')}
          icon={UserCircleIcon}
          onPress={() => router.push('/settings/account')}
        />
        <SettingsRow
          label={t('settings.notifications')}
          description={t('settings.notificationsHint')}
          icon={BellIcon}
          onPress={() => router.push('/settings/notifications')}
        />
        <SettingsRow
          label={t('settings.spots')}
          description={t('settings.spotsHint')}
          icon={SparkleIcon}
          onPress={() => router.push('/settings/spots')}
        />
        <SettingsRow
          label={t('settings.privacy')}
          description={t('settings.privacyHint')}
          icon={ShieldCheckIcon}
          onPress={() => router.push('/profile/privacy')}
        />
        <SettingsRow
          label={t('settings.about')}
          icon={InfoIcon}
          onPress={() => router.push('/about')}
        />
      </View>
    </ScrollView>
  )
}

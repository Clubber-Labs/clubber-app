import { ScrollView, View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import {
  UserCircleIcon,
  BellIcon,
  SparkleIcon,
  TranslateIcon,
  ShieldCheckIcon,
  InfoIcon,
} from 'phosphor-react-native'
import { SpotifyMark } from '@/shared/components/SpotifyMark'
import { useSpotifyProfile } from '@/features/spotify/hooks/useSpotifyProfile'
import { spotifyClientId } from '@/features/spotify/lib/spotifyAuth'
import { SettingsRow } from '@/shared/components/SettingsRow'
import { colors } from '@/shared/theme'

export default function SettingsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  // Só consulta o vínculo em build que oferece a linha do Spotify.
  const { data: spotify } = useSpotifyProfile({ enabled: !!spotifyClientId() })
  const spotifyLinked = !!spotify?.linked && spotify.status === 'ACTIVE'

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
        {/* Build sem credencial do Spotify não oferece a opção: melhor não
            existir do que abrir uma tela que só saberia dar erro. */}
        {spotifyClientId() && (
          <SettingsRow
            label={t('settings.spotify')}
            description={t('settings.spotifyHint')}
            icon={SpotifyMark}
            iconColor={spotifyLinked ? colors.spotify : undefined}
            onPress={() => router.push('/settings/spotify')}
          />
        )}
        <SettingsRow
          label={t('settings.language')}
          description={t('settings.languageHint')}
          icon={TranslateIcon}
          onPress={() => router.push('/settings/language')}
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

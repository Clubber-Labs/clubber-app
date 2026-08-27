import { useLocale } from '@/shared/hooks/useLocale'
import { colors } from '@/shared/theme'
import { formatDayOfMonthYear } from '@/shared/utils/dateFormat'
import { SpotifyLogoIcon } from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import type { SpotifyProfile } from '../types'

type Props = {
  profile: SpotifyProfile
}

/** Só desenha estado — as ações ficam na tela, como no SubscriptionCard. */
export function SpotifyLinkCard({ profile }: Props) {
  const { t } = useTranslation()
  const locale = useLocale()

  // Revogado = o vínculo existe aqui, mas o usuário tirou o Clubber lá no
  // Spotify. O dado congelou; reconectar é o mesmo fluxo de vincular.
  const isRevoked = profile.linked && profile.status === 'REVOKED'

  return (
    <View className="bg-surface border border-line rounded-2xl p-5 gap-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <SpotifyLogoIcon size={20} color={colors.brandText} />
          <Text className="text-content font-bold text-lg">
            {t('spotify.card.title')}
          </Text>
        </View>
        {profile.linked && (
          <View
            className={`px-2.5 py-1 rounded-full ${isRevoked ? 'bg-warning/20' : 'bg-brand/20'}`}
          >
            <Text
              className={`text-xs font-semibold ${isRevoked ? 'text-warning' : 'text-brand-text-strong'}`}
            >
              {t(
                isRevoked ? 'spotify.status.revoked' : 'spotify.status.active',
              )}
            </Text>
          </View>
        )}
      </View>

      {profile.linked ? (
        <View className="gap-1">
          {profile.displayName && (
            <Text className="text-content-tertiary text-sm">
              {profile.displayName}
            </Text>
          )}
          {isRevoked ? (
            <Text className="text-warning text-sm">
              {t('spotify.card.revokedHint')}
            </Text>
          ) : (
            profile.lastSyncedAt && (
              <Text className="text-content-muted text-sm">
                {t('spotify.card.syncedOn', {
                  date: formatDayOfMonthYear(profile.lastSyncedAt, locale),
                })}
              </Text>
            )
          )}
        </View>
      ) : (
        <View className="gap-2">
          <Text className="text-content-muted text-sm">
            {t('spotify.card.pitch')}
          </Text>
          {/* Vincular já expõe os artistas no perfil: avisar ANTES, não depois. */}
          <Text className="text-content-subtle text-xs leading-4">
            {t('spotify.card.visibilityNotice')}
          </Text>
        </View>
      )}
    </View>
  )
}

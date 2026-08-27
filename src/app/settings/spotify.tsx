import { ConsentToggleRow } from '@/features/privacy/components/ConsentToggleRow'
import { useProductPreferences } from '@/features/privacy/hooks/useProductPreferences'
import { ApplyGenresSection } from '@/features/spotify/components/ApplyGenresSection'
import { SpotifyLinkCard } from '@/features/spotify/components/SpotifyLinkCard'
import { useApplySpotifyGenres } from '@/features/spotify/hooks/useApplySpotifyGenres'
import { useLinkSpotify } from '@/features/spotify/hooks/useLinkSpotify'
import { useSpotifyProfile } from '@/features/spotify/hooks/useSpotifyProfile'
import { useUnlinkSpotify } from '@/features/spotify/hooks/useUnlinkSpotify'
import { useMyProfile } from '@/features/users/hooks/useProfile'
import { Button } from '@/shared/components/Button'
import { FormError } from '@/shared/components/FormError'
import { getApiError } from '@/shared/lib/apiError'
import { useConfirm } from '@/shared/lib/confirm'
import { colors } from '@/shared/theme'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'

export default function SpotifySettingsScreen() {
  const { t } = useTranslation()
  const confirm = useConfirm()
  const [error, setError] = useState<string | null>(null)

  const { data: profile, isError, refetch, isFetching } = useSpotifyProfile()
  const { data: me } = useMyProfile()
  const link = useLinkSpotify()
  const unlink = useUnlinkSpotify()
  const applyGenres = useApplySpotifyGenres()
  const { preferences, updatePreference } = useProductPreferences()

  // Otimista no hook, que reverte sozinho se o PUT falhar. O switch voltando
  // mostra QUE não salvou, mas não por quê — daí a mensagem, como faz a tela
  // de privacidade com as outras preferências de produto.
  async function handleVisibilityChange(value: boolean) {
    setError(null)
    const ok = await updatePreference('spotifyArtistsVisible', value)
    if (!ok) setError(t('spotify.visibility.saveError'))
  }

  async function handleApplyGenres(genres: string[]) {
    setError(null)
    try {
      await applyGenres.mutateAsync(genres)
    } catch (err) {
      setError(getApiError(err).message)
    }
  }

  // Erro fica inline, não em banner: a ação é deliberada e o usuário está
  // olhando pra esta tela — é o padrão de deactivate.tsx.
  async function handleLink() {
    setError(null)
    try {
      // authorize() devolve união pro cancelamento, mas LANÇA nos erros reais
      // (build sem client id, code ausente, falha do OAuth).
      await link.mutateAsync()
    } catch (err) {
      setError(getApiError(err).message)
    }
  }

  async function handleUnlink() {
    const ok = await confirm({
      title: t('spotify.disconnect.title'),
      message: t('spotify.disconnect.message'),
      confirmLabel: t('spotify.disconnect.confirm'),
      destructive: true,
    })
    if (!ok) return

    setError(null)
    try {
      await unlink.mutateAsync()
    } catch (err) {
      setError(getApiError(err).message)
    }
  }

  // O erro só toma a tela quando NÃO há o que mostrar. Com perfil em cache,
  // um refetch que falhou não justifica trocar dado utilizável por uma tela de
  // erro — e sem esta saída o `!profile` prenderia num spinner eterno, já que
  // o TanStack desliga o isLoading ao desistir.
  if (!profile) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-8 gap-3">
        {isError ? (
          <>
            <Text className="text-content-muted text-center text-sm">
              {t('spotify.loadError')}
            </Text>
            <Button
              label={t('common.retry')}
              variant="secondary"
              onPress={() => refetch()}
              loading={isFetching}
            />
          </>
        ) : (
          <ActivityIndicator color={colors.brand} />
        )}
      </View>
    )
  }

  const busy = link.isPending || unlink.isPending
  const isRevoked = profile.linked && profile.status === 'REVOKED'
  // O useAuthRequest gera o desafio PKCE de forma assíncrona: tocar antes
  // disso lançaria "indisponível neste build", que seria mentira — o build
  // está certo, só ainda não terminou de preparar.
  const canLink = link.isReady && !busy

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-4 pt-6 pb-4 border-b border-line">
        <Text className="text-xl font-bold text-content">
          {t('settings.spotify')}
        </Text>
        <Text className="text-xs text-content-subtle mt-1">
          {t('settings.spotifyScreen.subtitle')}
        </Text>
      </View>

      <View className="mx-4 mt-4 gap-3">
        <SpotifyLinkCard profile={profile} />

        {/* Só faz sentido oferecer quando há gosto sincronizado: vínculo
            revogado tem dado congelado, e sem gênero não há o que aplicar.
            Espera o `me` porque sem os interesses atuais a seção ofereceria
            estilos que já estão no perfil. */}
        {profile.status === 'ACTIVE' && profile.genres.length > 0 && me && (
          <ApplyGenresSection
            genres={profile.genres}
            currentInterests={me.preferredSubcategories ?? []}
            isApplying={applyGenres.isPending}
            onApply={handleApplyGenres}
          />
        )}

        {/* Só depois de vinculado: sem artistas o toggle não governa nada. */}
        {profile.linked && (
          <View className="bg-surface-sunken border border-line rounded-xl overflow-hidden">
            <ConsentToggleRow
              label={t('spotify.visibility.label')}
              description={t('spotify.visibility.description')}
              value={preferences.spotifyArtistsVisible}
              onChange={handleVisibilityChange}
              isLast
            />
          </View>
        )}

        <FormError message={error} />

        {profile.linked ? (
          <View className="gap-3">
            {isRevoked && (
              <Button
                label={t('spotify.actions.reconnect')}
                onPress={handleLink}
                loading={link.isPending}
                disabled={!canLink}
              />
            )}
            <Button
              label={t('spotify.actions.disconnect')}
              variant="secondary"
              onPress={handleUnlink}
              loading={unlink.isPending}
              disabled={busy}
            />
            {/* Desvincular apaga o que guardamos, mas quem tira o acesso de
                vez é o próprio Spotify — a copy diz onde. */}
            <Text className="text-content-subtle text-xs leading-4 px-1">
              {t('settings.spotifyScreen.revokeElsewhere')}
            </Text>
          </View>
        ) : (
          <Button
            label={t('spotify.actions.connect')}
            onPress={handleLink}
            loading={link.isPending}
            disabled={!canLink}
          />
        )}
      </View>
    </ScrollView>
  )
}

import type { CompleteProfileInput } from '@/features/auth/schemas/completeProfileSchema'
import { FormError } from '@/shared/components/FormError'
import { useCategories } from '@/shared/hooks/useCategories'
import { getApiError } from '@/shared/lib/apiError'
import { colors } from '@/shared/theme'
import { SpotifyLogoIcon } from 'phosphor-react-native'
import { useState } from 'react'
import { type Control, useController } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { useLinkSpotify } from '../hooks/useLinkSpotify'
import { spotifyClientId } from '../lib/spotifyAuth'
import { FALLBACK_GENRE_CATEGORY, MAX_IMPORTED_GENRES } from '../constants'

type Props = {
  control: Control<CompleteProfileInput>
}

const MAX_INTERESTS = 30

/**
 * Atalho do cadastro: vincula o Spotify e já deixa os seletores marcados, o que
 * transforma o formulário de questionário em confirmação — o momento de maior
 * fricção é justamente este.
 *
 * NÃO grava no perfil: só pré-preenche, e quem grava segue sendo o submit do
 * formulário. Assim, abandonar o cadastro no meio não deixa preferência
 * escrita pela metade.
 */
export function SpotifyImportButton({ control }: Props) {
  const { t } = useTranslation()
  const { genreAppliesTo } = useCategories()
  const [error, setError] = useState<string | null>(null)

  const { field: categories } = useController({
    control,
    name: 'preferredCategories',
  })
  const { field: interests } = useController({
    control,
    name: 'preferredSubcategories',
  })

  // Sem recarregar o perfil: o submit do formulário é quem grava, e um refetch
  // que falhasse aqui desmontaria o formulário inteiro.
  const link = useLinkSpotify({ refreshProfile: false })

  // Build sem credencial não oferece o atalho, igual à linha de Configurações.
  if (!spotifyClientId()) return null

  async function handleImport() {
    setError(null)
    try {
      const result = await link.mutateAsync()
      // Desistiu na tela do Spotify: a tela fica como estava, sem alarde.
      if (result.kind !== 'linked') return

      const imported = result.profile.genres.slice(0, MAX_IMPORTED_GENRES)
      if (imported.length === 0) return

      const currentInterests = interests.value ?? []
      interests.onChange(
        [...new Set([...currentInterests, ...imported])].slice(
          0,
          MAX_INTERESTS,
        ),
      )

      // Sem categoria compatível o estilo importado nunca casaria com evento
      // nenhum. A checagem sai da taxonomia do servidor, não de lista fixa.
      const currentCategories = categories.value ?? []
      const compatible = imported.some(genre =>
        (genreAppliesTo(genre) ?? []).some(c => currentCategories.includes(c)),
      )
      if (!compatible) {
        categories.onChange([...currentCategories, FALLBACK_GENRE_CATEGORY])
      }
    } catch (err) {
      setError(getApiError(err).message)
    }
  }

  const busy = link.isPending

  return (
    <View className="gap-2">
      <Pressable
        onPress={handleImport}
        disabled={busy || !link.isReady}
        className={`flex-row items-center justify-center gap-2 border border-line-strong rounded-xl py-3.5 active:opacity-70 ${
          busy || !link.isReady ? 'opacity-50' : ''
        }`}
      >
        {busy ? (
          <ActivityIndicator size="small" color={colors.contentMuted} />
        ) : (
          <>
            <SpotifyLogoIcon size={18} color={colors.content} />
            <Text className="text-content-secondary text-sm font-semibold">
              {t('spotify.onboarding.cta')}
            </Text>
          </>
        )}
      </Pressable>
      <Text className="text-content-subtle text-xs text-center leading-4">
        {t('spotify.onboarding.hint')}
      </Text>
      <FormError message={error} />
    </View>
  )
}

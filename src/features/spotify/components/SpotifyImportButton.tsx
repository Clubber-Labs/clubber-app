import { FormError } from '@/shared/components/FormError'
import { useCategories } from '@/shared/hooks/useCategories'
import { getApiError } from '@/shared/lib/apiError'
import { colors } from '@/shared/theme'
import {
  MAX_PREFERRED_CATEGORIES,
  MAX_PREFERRED_INTERESTS,
} from '@/shared/utils/rolePreferences'
import { SpotifyLogoIcon } from 'phosphor-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { FALLBACK_GENRE_CATEGORY, MAX_IMPORTED_GENRES } from '../constants'
import { useLinkSpotify } from '../hooks/useLinkSpotify'
import { spotifyClientId } from '../lib/spotifyAuth'

export type ImportedTaste = {
  categories: string[]
  interests: string[]
}

type Props = {
  categories: string[]
  interests: string[]
  /** Recebe as duas listas já mescladas — quem grava é o formulário. */
  onImport: (next: ImportedTaste) => void
}

/**
 * Atalho do cadastro: vincula o Spotify e devolve os interesses já mesclados,
 * o que transforma o formulário de questionário em confirmação — o momento de
 * maior fricção é justamente este.
 *
 * Não conhece o formulário (nem react-hook-form) de propósito: recebe listas e
 * devolve listas. Assim esta feature não precisa importar a de cadastro.
 */
export function SpotifyImportButton({
  categories,
  interests,
  onImport,
}: Props) {
  const { t } = useTranslation()
  const { genreAppliesTo } = useCategories()
  const [error, setError] = useState<string | null>(null)

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

      // Sem categoria compatível o estilo importado nunca casaria com evento
      // nenhum. A checagem sai da taxonomia do servidor, não de lista fixa.
      const compatible = imported.some(genre =>
        (genreAppliesTo(genre) ?? []).some(c => categories.includes(c)),
      )
      const nextCategories = compatible
        ? categories
        : [...new Set([...categories, FALLBACK_GENRE_CATEGORY])]

      onImport({
        categories: nextCategories.slice(0, MAX_PREFERRED_CATEGORIES),
        interests: [...new Set([...interests, ...imported])].slice(
          0,
          MAX_PREFERRED_INTERESTS,
        ),
      })
    } catch (err) {
      setError(getApiError(err).message)
    }
  }

  const disabled = link.isPending || !link.isReady

  return (
    <View className="gap-2">
      <Pressable
        onPress={handleImport}
        disabled={disabled}
        className={`flex-row items-center justify-center gap-2 border border-line-strong rounded-full py-3.5 active:opacity-70 ${
          disabled ? 'opacity-50' : ''
        }`}
      >
        {link.isPending ? (
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

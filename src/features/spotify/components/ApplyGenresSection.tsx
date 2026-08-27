import { Button } from '@/shared/components/Button'
import { Chip } from '@/shared/components/Chip'
import { useCategories } from '@/shared/hooks/useCategories'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'

type Props = {
  /** Gêneros que o sync importou, já ordenados por afinidade. */
  genres: string[]
  /** Interesses que o perfil já tem — o que se repete não é novidade. */
  currentInterests: string[]
  isApplying: boolean
  onApply: (genres: string[]) => void
}

/**
 * Oferta de aplicar o gosto importado aos interesses. Opt-in explícito: mostra
 * exatamente o que vai entrar e deixa desmarcar, porque sobrescrever o perfil
 * de alguém em silêncio não é importar, é decidir por ele.
 */
export function ApplyGenresSection({
  genres,
  currentInterests,
  isApplying,
  onApply,
}: Props) {
  const { t } = useTranslation()
  const { labelFor } = useCategories()

  const novos = genres.filter(g => !currentInterests.includes(g))
  const [desmarcados, setDesmarcados] = useState<string[]>([])

  function toggle(genre: string) {
    setDesmarcados(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre],
    )
  }

  // Tudo que veio do Spotify já está no perfil: não há o que oferecer.
  if (novos.length === 0) {
    return (
      <View className="bg-surface border border-line rounded-2xl p-5 gap-1">
        <Text className="text-content font-semibold text-sm">
          {t('spotify.apply.upToDateTitle')}
        </Text>
        <Text className="text-content-muted text-xs leading-4">
          {t('spotify.apply.upToDateBody')}
        </Text>
      </View>
    )
  }

  const selecionados = novos.filter(g => !desmarcados.includes(g))

  return (
    <View className="bg-surface border border-line rounded-2xl p-5 gap-4">
      <View className="gap-1">
        <Text className="text-content font-semibold text-sm">
          {t('spotify.apply.title')}
        </Text>
        <Text className="text-content-muted text-xs leading-4">
          {t('spotify.apply.body')}
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {novos.map(genre => (
          <Chip
            key={genre}
            label={labelFor(genre)}
            active={!desmarcados.includes(genre)}
            onPress={() => toggle(genre)}
            disabled={isApplying}
          />
        ))}
      </View>

      <Button
        label={t('spotify.apply.cta', { count: selecionados.length })}
        onPress={() => onApply(selecionados)}
        loading={isApplying}
        disabled={isApplying || selecionados.length === 0}
      />
    </View>
  )
}

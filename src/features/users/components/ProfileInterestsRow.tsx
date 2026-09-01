import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ProfileInterestChip } from './ProfileInterestChip'
import { useCategories } from '@/shared/hooks/useCategories'
import { interestEmoji } from '@/shared/utils/interestEmoji'

type Props = {
  values: string[]
  /** Quais destes o Spotify sustenta — já resolvido pelo servidor. */
  confirmed?: string[]
  // Dono do perfil: abre a folha de interesses. Visitante: só exibição.
  onPress?: () => void
}

// Altura de um chip (py-1 + texto de 11px) — a fileira recorta o que passar.
const ROW_HEIGHT = 26
const MAX_VISIBLE = 6

/**
 * Interesses do perfil em UMA linha: emoji + rótulo por chip e um "+N" com o
 * que não coube. Quantos cabem depende dos rótulos, então a fileira mede: o
 * chip que quebrar de linha reporta pelo onLayout e o limite recua até o "+N"
 * caber na primeira linha. Converge em uma ou duas passadas de layout.
 */
export function ProfileInterestsRow({ values, confirmed, onPress }: Props) {
  const { t } = useTranslation()
  const { labelFor, parentOf } = useCategories()
  const [limit, setLimit] = useState(Math.min(values.length, MAX_VISIBLE))
  const valuesKey = values.join('|')

  useEffect(() => {
    setLimit(Math.min(values.length, MAX_VISIBLE))
    // A lista nova reinicia a medição; `values` muda de identidade a cada
    // render do pai, a chave não.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valuesKey])

  if (values.length === 0) {
    if (!onPress) return null
    return (
      <View className="mt-2.5 flex-row">
        <ProfileInterestChip
          label={t('profile.interests.add')}
          outline
          onPress={onPress}
        />
      </View>
    )
  }

  const backed = new Set(confirmed ?? [])
  const visible = values.slice(0, limit)
  const hidden = values.length - visible.length

  return (
    <View
      className="mt-2.5 flex-row flex-wrap gap-1.5"
      style={{ height: ROW_HEIGHT, overflow: 'hidden' }}
    >
      {visible.map((value, i) => {
        const label = labelFor(value)
        const isBacked = backed.has(value)
        return (
          <ProfileInterestChip
            key={value}
            label={`${interestEmoji(value, parentOf(value))} ${label}`}
            confirmed={isBacked}
            accessibilityLabel={
              isBacked ? `${label}, ${t('spotify.confirmed.label')}` : label
            }
            onPress={onPress}
            onLayout={e => {
              // Quebrou de linha: este e os seguintes viram "+N".
              if (e.nativeEvent.layout.y > 0) {
                setLimit(prev => Math.max(1, Math.min(prev, i)))
              }
            }}
          />
        )
      })}
      {hidden > 0 && (
        <ProfileInterestChip
          label={t('profile.mural.more', { count: hidden })}
          outline
          onPress={onPress}
          onLayout={e => {
            if (e.nativeEvent.layout.y > 0) {
              setLimit(prev => Math.max(1, prev - 1))
            }
          }}
        />
      )}
    </View>
  )
}

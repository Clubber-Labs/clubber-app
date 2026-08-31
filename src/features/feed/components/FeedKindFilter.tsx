import { ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Chip } from '@/shared/components/Chip'
import type { FeedKind } from '../types'

type Option = {
  value: FeedKind
  // Chave do dicionário: frase pronta na constante congelaria o idioma no boot.
  labelKey: `feed.kindFilter.${'all' | 'events' | 'spots'}`
}

const OPTIONS: Option[] = [
  { value: 'ALL', labelKey: 'feed.kindFilter.all' },
  { value: 'EVENTS', labelKey: 'feed.kindFilter.events' },
  { value: 'SPOTS', labelKey: 'feed.kindFilter.spots' },
]

type Props = {
  value: FeedKind
  onChange: (next: FeedKind) => void
}

// O que entra no feed. Escolha ÚNICA (ao contrário dos chips de status, que
// somam): as três opções já cobrem o conjunto inteiro, e "nenhum" não é um
// estado que faça sentido pedir ao backend.
export function FeedKindFilter({ value, onChange }: Props) {
  const { t } = useTranslation()
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
    >
      {OPTIONS.map(option => (
        <Chip
          key={option.value}
          label={t(option.labelKey)}
          active={value === option.value}
          onPress={() => onChange(option.value)}
        />
      ))}
    </ScrollView>
  )
}

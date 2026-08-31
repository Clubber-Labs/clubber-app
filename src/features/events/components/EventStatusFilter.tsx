import { ScrollView, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { StatusChip } from './StatusChip'
import type { EventStatus } from '@/shared/types'

type Option = {
  value: EventStatus
  // Chave do dicionário: frase pronta na constante congelaria o idioma no boot.
  labelKey: `events.statusFilter.${'ongoing' | 'soon' | 'upcoming' | 'past'}`
}

// Ordem do mais "atual" pro mais antigo — facilita scan visual.
const OPTIONS: Option[] = [
  { value: 'ONGOING', labelKey: 'events.statusFilter.ongoing' },
  { value: 'SOON', labelKey: 'events.statusFilter.soon' },
  { value: 'UPCOMING', labelKey: 'events.statusFilter.upcoming' },
  { value: 'PAST', labelKey: 'events.statusFilter.past' },
]

type Props = {
  value: EventStatus[]
  onChange: (next: EventStatus[]) => void
  // Quebra em linhas (flex-wrap) em vez do scroll horizontal — para o sheet de
  // filtros do mapa, onde os chips ficam empilhados com os de categoria.
  wrap?: boolean
}

export function EventStatusFilter({ value, onChange, wrap }: Props) {
  const { t } = useTranslation()
  function toggle(status: EventStatus) {
    const next = value.includes(status)
      ? value.filter(s => s !== status)
      : [...value, status]
    // Ordena pela ordem canônica do OPTIONS pra evitar queryKeys duplicadas
    // (ex: [SOON, ONGOING] ≠ [ONGOING, SOON] no hash do react-query).
    onChange(OPTIONS.map(o => o.value).filter(s => next.includes(s)))
  }

  const chips = OPTIONS.map(option => (
    <StatusChip
      key={option.value}
      label={t(option.labelKey)}
      active={value.includes(option.value)}
      onPress={() => toggle(option.value)}
      // No sheet do mapa (wrap) os chips de status dividem a folha com os de
      // categoria: a moldura do espectro ali viraria só mais uma cor na pilha.
      spectrum={!wrap && option.value === 'ONGOING'}
    />
  ))

  if (wrap) {
    return <View className="flex-row flex-wrap gap-2">{chips}</View>
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // ScrollView do RN vem com flexShrink 1: dentro de um pai de altura
      // definida (o Collapsible que esconde a linha na aba Rolês) ele encolhe
      // junto e a fileira mede zero — some pra sempre. Aqui ela sempre tem a
      // altura dos chips, e quem clipa é o pai.
      style={{ flexShrink: 0 }}
      // 16 alinha o 1º chip com o rótulo das abas e com a borda dos cards.
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
    >
      {chips}
    </ScrollView>
  )
}

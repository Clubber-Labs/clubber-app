import { View, Text } from 'react-native'
import { useLocale } from '@/shared/hooks/useLocale'
import { formatMonthShort } from '@/shared/utils/dateFormat'

type Props = {
  date: string
  // Eventos passados/cancelados perdem o destaque da marca no mês.
  muted?: boolean
  // Versão menor para tiles densos (grade do perfil).
  compact?: boolean
}

// A abreviação vem com ponto em vários idiomas ("mar.", "ene.") — só o ponto
// sai. Filtrar por [^a-zA-Z] comeria as acentuadas.
function parts(iso: string, locale: string): { month: string; day: string } {
  const month = formatMonthShort(iso, locale).replace(/\./g, '').toUpperCase()
  return { month, day: String(new Date(iso).getDate()) }
}

export function EventDateChip({ date, muted = false, compact = false }: Props) {
  const locale = useLocale()
  const { month, day } = parts(date, locale)
  return (
    <View
      className={`overflow-hidden rounded-lg border border-white/15 ${
        compact ? 'w-10' : 'w-12'
      }`}
    >
      <Text
        className={`py-0.5 text-center font-extrabold tracking-wider text-content ${
          compact ? 'text-[9px]' : 'text-[10px]'
        } ${muted ? 'bg-surface-higher' : 'bg-brand'}`}
      >
        {month}
      </Text>
      <Text
        className={`py-1 text-center font-extrabold leading-none text-content ${
          compact ? 'text-base' : 'text-lg'
        }`}
      >
        {day}
      </Text>
    </View>
  )
}

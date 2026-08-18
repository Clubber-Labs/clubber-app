import { useMemo } from 'react'
import { View } from 'react-native'
import {
  WheelColumn,
  WHEEL_ITEM_HEIGHT,
  WHEEL_VISIBLE_ITEMS,
} from './WheelColumn'
import { formatMonthShort } from '@/shared/utils/dateFormat'
import { useLocale } from '@/shared/hooks/useLocale'

// A abreviação do date-fns vem minúscula e às vezes com ponto ("jan.", "ene.");
// a roda usa maiúscula inicial e sem ponto, como a tabela manual usava.
function monthLabel(month: number, locale: string): string {
  const raw = formatMonthShort(new Date(2000, month, 1), locale).replace(
    /\./g,
    '',
  )
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

type Props = {
  value: Date
  onChange: (date: Date) => void
  minimumDate?: Date
  maximumDate?: Date
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function range(from: number, to: number): number[] {
  if (to < from) return []
  return Array.from({ length: to - from + 1 }, (_, i) => from + i)
}

function clampDate(date: Date, min?: Date, max?: Date): Date {
  if (min && date < min) return min
  if (max && date > max) return max
  return date
}

// Seletor de data dia/mês/ano em rodas (estilo Tinder), no nosso tema dark:
// banda de seleção da marca ao centro, colunas que desbotam nas bordas. Cada
// coluna só oferece valores dentro do intervalo permitido — assim a roda nunca
// para num valor que o pai teria que recusar.
export function WheelDatePicker({
  value,
  onChange,
  minimumDate,
  maximumDate,
}: Props) {
  const locale = useLocale()
  const day = value.getDate()
  const month = value.getMonth()
  const year = value.getFullYear()

  // Limites como escalares, não como Date: chamadores passam `new Date()` inline
  // e a identidade muda a cada render — os números não, então as listas abaixo
  // mantêm identidade estável e as colunas não se reposicionam à toa.
  const minYear = minimumDate?.getFullYear() ?? 1920
  const minMonth = minimumDate?.getMonth() ?? 0
  const minDay = minimumDate?.getDate() ?? 1
  const maxYear = maximumDate?.getFullYear() ?? new Date().getFullYear()
  const maxMonth = maximumDate?.getMonth() ?? 11
  const maxDay = maximumDate?.getDate() ?? 31

  const years = useMemo(
    () =>
      range(minYear, maxYear)
        .reverse()
        .map(y => ({ label: String(y), value: y })),
    [minYear, maxYear],
  )

  // Memoiza pelo intervalo, não pelo ano/mês: trocar de 1998 pra 1999 dá a mesma
  // lista de meses, e recriar o array faria a coluna reencaixar e piscar à toa.
  const monthFrom = year === minYear ? minMonth : 0
  const monthTo = year === maxYear ? maxMonth : 11
  const months = useMemo(
    () =>
      range(monthFrom, monthTo).map(m => ({
        label: monthLabel(m, locale),
        value: m,
      })),
    [monthFrom, monthTo, locale],
  )

  const dayFrom = year === minYear && month === minMonth ? minDay : 1
  const dayTo =
    year === maxYear && month === maxMonth ? maxDay : daysInMonth(year, month)
  const days = useMemo(
    () => range(dayFrom, dayTo).map(d => ({ label: String(d), value: d })),
    [dayFrom, dayTo],
  )

  // `safeDay` evita o rollover do Date (31 de fev vira março) enquanto as outras
  // colunas ainda não reencaixaram; `clampDate` segura o valor emitido no
  // intervalo durante esse mesmo instante. Nenhum dos dois move a roda.
  function commit(nextYear: number, nextMonth: number, nextDay: number) {
    const safeDay = Math.min(nextDay, daysInMonth(nextYear, nextMonth))
    onChange(
      clampDate(
        new Date(nextYear, nextMonth, safeDay),
        minimumDate,
        maximumDate,
      ),
    )
  }

  const containerHeight = WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ITEMS

  return (
    <View style={{ height: containerHeight }} className="relative">
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: (containerHeight - WHEEL_ITEM_HEIGHT) / 2,
          height: WHEEL_ITEM_HEIGHT,
        }}
        className="bg-brand-surface/30 border border-brand-surface-strong rounded-2xl"
      />
      <View className="flex-row">
        <WheelColumn
          items={days}
          initialValue={day}
          onSelect={d => commit(year, month, d)}
        />
        <WheelColumn
          items={months}
          initialValue={month}
          onSelect={m => commit(year, m, day)}
          flex={1.3}
        />
        <WheelColumn
          items={years}
          initialValue={year}
          onSelect={y => commit(y, month, day)}
        />
      </View>
    </View>
  )
}

import { useMemo } from 'react'
import { View, Text } from 'react-native'
import {
  WheelColumn,
  WHEEL_ITEM_HEIGHT,
  WHEEL_VISIBLE_ITEMS,
} from './WheelColumn'
import { formatWheelDay } from '@/shared/utils/dateFormat'

type Props = {
  value: Date
  onChange: (date: Date) => void
  minimumDate?: Date
  maximumDate?: Date
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function diffDays(a: Date, b: Date): number {
  return Math.round(
    (startOfDay(a).getTime() - startOfDay(b).getTime()) / 86400000,
  )
}

function addDays(base: Date, days: number): Date {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + days)
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

const pad = (n: number) => String(n).padStart(2, '0')

const COLUMN_LABEL =
  'text-center text-content-subtle text-[11px] font-bold uppercase tracking-wider'

// Seletor de data+hora em rodas (padrão iOS), no tema dark da marca. Coluna de
// data com rótulo relativo ("Hoje" / "qua, 12 de mar") + Hora + Minuto — bem
// mais usável que cinco colunas numéricas. Nos extremos do intervalo as colunas
// de hora e minuto encolhem, então não dá pra parar num horário inválido.
export function WheelDateTimePicker({
  value,
  onChange,
  minimumDate,
  maximumDate,
}: Props) {
  // Limites como escalares, não como Date: chamadores passam `new Date()` inline
  // e a identidade muda a cada render — os números não, então as listas abaixo
  // mantêm identidade estável e as colunas não se reposicionam à toa.
  const baseSource = minimumDate ?? new Date()
  const baseYear = baseSource.getFullYear()
  const baseMonth = baseSource.getMonth()
  const baseDay = baseSource.getDate()
  const base = useMemo(
    () => new Date(baseYear, baseMonth, baseDay),
    [baseYear, baseMonth, baseDay],
  )

  const minHour = minimumDate?.getHours() ?? 0
  const minMinute = minimumDate?.getMinutes() ?? 0
  const maxHour = maximumDate?.getHours() ?? 23
  const maxMinute = maximumDate?.getMinutes() ?? 59

  const valueOffset = diffDays(value, base)
  const lastOffset = maximumDate ? diffDays(maximumDate, base) : 365
  const maxOffset = Math.max(lastOffset, valueOffset, 0)

  const offset = Math.max(0, Math.min(maxOffset, valueOffset))
  const hour = value.getHours()
  const minute = value.getMinutes()

  const atMinDay = !!minimumDate && offset === 0
  const atMaxDay = !!maximumDate && offset === lastOffset

  const dateItems = useMemo(
    () =>
      Array.from({ length: maxOffset + 1 }, (_, i) => ({
        label: formatWheelDay(addDays(base, i)),
        value: i,
      })),
    [maxOffset, base],
  )

  // Memoiza pelo intervalo, não pelo dia/hora: fora dos extremos a lista é sempre
  // a mesma, e recriar o array faria a coluna reencaixar e piscar à toa.
  const hourFrom = atMinDay ? minHour : 0
  const hourTo = atMaxDay ? maxHour : 23
  const hourItems = useMemo(
    () => range(hourFrom, hourTo).map(h => ({ label: pad(h), value: h })),
    [hourFrom, hourTo],
  )

  const minuteFrom = atMinDay && hour === minHour ? minMinute : 0
  const minuteTo = atMaxDay && hour === maxHour ? maxMinute : 59
  const minuteItems = useMemo(
    () => range(minuteFrom, minuteTo).map(m => ({ label: pad(m), value: m })),
    [minuteFrom, minuteTo],
  )

  // Guarda de valor enquanto as outras colunas ainda não reencaixaram; não move
  // a roda.
  function commit(nextOffset: number, nextHour: number, nextMinute: number) {
    const next = addDays(base, nextOffset)
    next.setHours(nextHour, nextMinute, 0, 0)
    onChange(clampDate(next, minimumDate, maximumDate))
  }

  const containerHeight = WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ITEMS

  return (
    <View>
      <View className="flex-row mb-1">
        <Text style={{ flex: 1 }} className={COLUMN_LABEL}>
          Data
        </Text>
        <Text style={{ flex: 1 }} className={COLUMN_LABEL}>
          Hora
        </Text>
        <Text style={{ flex: 1 }} className={COLUMN_LABEL}>
          Min
        </Text>
      </View>

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
            items={dateItems}
            initialValue={offset}
            onSelect={o => commit(o, hour, minute)}
            flex={3.2}
          />
          <WheelColumn
            items={hourItems}
            initialValue={hour}
            onSelect={h => commit(offset, h, minute)}
          />
          <WheelColumn
            items={minuteItems}
            initialValue={minute}
            onSelect={m => commit(offset, hour, m)}
          />
        </View>
      </View>
    </View>
  )
}

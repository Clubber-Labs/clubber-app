import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { useLocale } from '@/shared/hooks/useLocale'
import { formatDateTime, formatShortDate } from '@/shared/utils/dateFormat'
import { SheetModal } from './SheetModal'
import { WheelDatePicker } from './WheelDatePicker'
import { WheelDateTimePicker } from './WheelDateTimePicker'

type Mode = 'date' | 'datetime'

type Props = {
  value: Date | undefined
  onChange: (date: Date) => void
  placeholder?: string
  maximumDate?: Date
  minimumDate?: Date
  hasError?: boolean
  mode?: Mode
}

function formatValue(value: Date, mode: Mode, locale: string): string {
  return mode === 'datetime'
    ? formatDateTime(value, locale)
    : formatShortDate(value, locale)
}

// Campo de data/hora: mostra o valor e abre a roda própria (tema dark da marca)
// numa folha. Edita um rascunho — só comita no "Confirmar", então rolar as rodas
// não dispara updates parciais no form. Sem picker nativo (não aceita a marca).
export function DatePicker({
  value,
  onChange,
  placeholder = 'Selecione uma data',
  maximumDate,
  minimumDate,
  hasError,
  mode = 'date',
}: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Date>(value ?? minimumDate ?? new Date())
  const locale = useLocale()

  function handleOpen() {
    setDraft(value ?? minimumDate ?? new Date())
    setOpen(true)
  }

  function handleConfirm() {
    onChange(draft)
    setOpen(false)
  }

  return (
    <>
      <Pressable
        onPress={handleOpen}
        className={`border ${hasError ? 'border-content' : 'border-line'} bg-surface rounded-xl px-4 py-3.5`}
      >
        <Text
          className={
            value ? 'text-base text-content' : 'text-base text-content-subtle'
          }
        >
          {value ? formatValue(value, mode, locale) : placeholder}
        </Text>
      </Pressable>

      <SheetModal visible={open} onClose={() => setOpen(false)}>
        <View className="px-5 pt-1">
          <View className="flex-row items-center justify-between pb-3">
            <Text className="text-content text-xl font-extrabold">
              {mode === 'datetime' ? 'Data e hora' : 'Data'}
            </Text>
            <Pressable onPress={handleConfirm} hitSlop={8}>
              <Text className="text-brand-text text-[15px] font-bold">
                Confirmar
              </Text>
            </Pressable>
          </View>

          {mode === 'datetime' ? (
            <WheelDateTimePicker
              value={draft}
              onChange={setDraft}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
            />
          ) : (
            <WheelDatePicker
              value={draft}
              onChange={setDraft}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
            />
          )}
        </View>
      </SheetModal>
    </>
  )
}

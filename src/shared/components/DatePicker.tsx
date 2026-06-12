import { useState } from 'react'
import { View, Text, Pressable, Modal, Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'

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

function formatValue(value: Date, mode: Mode): string {
  if (mode === 'datetime') {
    return `${value.toLocaleDateString('pt-BR')} ${value.toLocaleTimeString(
      'pt-BR',
      { hour: '2-digit', minute: '2-digit' },
    )}`
  }
  return value.toLocaleDateString('pt-BR')
}

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
  const [step, setStep] = useState<'date' | 'time'>('date')
  const pickerValue = value ?? minimumDate ?? maximumDate ?? new Date()

  function handleClose() {
    setOpen(false)
    setStep('date')
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className={`border ${hasError ? 'border-white' : 'border-zinc-800'} bg-zinc-900 rounded-xl px-4 py-3.5`}
      >
        <Text
          className={value ? 'text-base text-white' : 'text-base text-zinc-500'}
        >
          {value ? formatValue(value, mode) : placeholder}
        </Text>
      </Pressable>

      {Platform.OS === 'ios' ? (
        <Modal visible={open} transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/40">
            <View className="bg-zinc-900 rounded-t-2xl pb-8">
              <View className="flex-row justify-end px-4 pt-4 pb-2">
                <Pressable onPress={handleClose}>
                  <Text className="text-violet-400 font-semibold text-base">
                    Confirmar
                  </Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={pickerValue}
                mode={mode === 'datetime' ? 'datetime' : 'date'}
                display="spinner"
                maximumDate={maximumDate}
                minimumDate={minimumDate}
                onValueChange={(_, date) => onChange(date)}
                locale="pt-BR"
              />
            </View>
          </View>
        </Modal>
      ) : (
        open && (
          <DateTimePicker
            value={pickerValue}
            mode={mode === 'datetime' ? step : 'date'}
            display="default"
            maximumDate={maximumDate}
            minimumDate={minimumDate}
            onValueChange={(_, date) => {
              if (mode === 'datetime' && step === 'date') {
                onChange(date)
                setStep('time')
              } else {
                onChange(date)
                handleClose()
              }
            }}
            onDismiss={handleClose}
          />
        )
      )}
    </>
  )
}

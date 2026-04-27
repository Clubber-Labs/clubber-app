import { useState } from 'react'
import { View, Text, Pressable, Modal, Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'

type Props = {
  value: Date | undefined
  onChange: (date: Date) => void
  placeholder?: string
  maximumDate?: Date
  minimumDate?: Date
  hasError?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Selecione uma data',
  maximumDate,
  minimumDate,
  hasError,
}: Props) {
  const [open, setOpen] = useState(false)
  const pickerValue = value ?? maximumDate ?? new Date()

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className={`border ${hasError ? 'border-red-400' : 'border-zinc-800'} bg-zinc-900 rounded-xl px-4 py-3.5`}
      >
        <Text
          className={
            value ? 'text-base text-white' : 'text-base text-zinc-500'
          }
        >
          {value ? value.toLocaleDateString('pt-BR') : placeholder}
        </Text>
      </Pressable>

      {Platform.OS === 'ios' ? (
        <Modal visible={open} transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/40">
            <View className="bg-zinc-900 rounded-t-2xl pb-8">
              <View className="flex-row justify-end px-4 pt-4 pb-2">
                <Pressable onPress={() => setOpen(false)}>
                  <Text className="text-violet-400 font-semibold text-base">
                    Confirmar
                  </Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={pickerValue}
                mode="date"
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
            mode="date"
            display="default"
            maximumDate={maximumDate}
            minimumDate={minimumDate}
            onValueChange={(_, date) => {
              setOpen(false)
              onChange(date)
            }}
            onDismiss={() => setOpen(false)}
          />
        )
      )}
    </>
  )
}

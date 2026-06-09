import { useRef } from 'react'
import { Pressable, View, Text, TextInput } from 'react-native'

type Props = {
  value: string
  onChangeText: (value: string) => void
  length?: number
  autoFocus?: boolean
  error?: boolean
  onComplete?: (value: string) => void
}

// OTP via um único TextInput invisível por cima das caixas: colar, autofill,
// auto-avanço e backspace saem de graça do comportamento nativo do input.
export function OtpInput({
  value,
  onChangeText,
  length = 6,
  autoFocus,
  error,
  onComplete,
}: Props) {
  const inputRef = useRef<TextInput>(null)

  function handleChange(text: string) {
    const digits = text.replace(/\D/g, '').slice(0, length)
    onChangeText(digits)
    if (digits.length === length) onComplete?.(digits)
  }

  const boxes = Array.from({ length }, (_, i) => value[i] ?? '')
  const focusedIndex = Math.min(value.length, length - 1)

  return (
    <Pressable onPress={() => inputRef.current?.focus()}>
      <View className="flex-row justify-between">
        {boxes.map((digit, i) => (
          <View
            key={i}
            className={`w-12 h-14 rounded-xl border items-center justify-center bg-zinc-900 ${
              error
                ? 'border-white'
                : i === focusedIndex
                  ? 'border-violet-500'
                  : 'border-zinc-800'
            }`}
          >
            <Text className="text-2xl font-semibold text-white">{digit}</Text>
          </View>
        ))}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        maxLength={length}
        autoFocus={autoFocus}
        caretHidden
        className="absolute w-full h-full opacity-0"
        accessibilityLabel="Código de verificação de 6 dígitos"
        accessibilityValue={{
          text: `${value.length} de ${length} dígitos preenchidos`,
        }}
      />
    </Pressable>
  )
}

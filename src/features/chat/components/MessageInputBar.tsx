import { useState } from 'react'
import { View, Text, TextInput, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type Props = {
  onSendText: (text: string) => void
  onAttach: () => void
  disabled?: boolean
}

export function MessageInputBar({ onSendText, onAttach, disabled }: Props) {
  const [text, setText] = useState('')
  const trimmed = text.trim()
  const canSend = trimmed.length > 0 && !disabled
  const nearLimit = text.length > 1800

  function handleSend() {
    if (!canSend) return
    onSendText(trimmed)
    setText('')
  }

  return (
    <View className="flex-row items-end gap-2 px-3 py-2 border-t border-zinc-900 bg-black">
      <Pressable
        onPress={onAttach}
        disabled={disabled}
        className="w-10 h-10 items-center justify-center"
        accessibilityLabel="Anexar imagem"
      >
        <Ionicons
          name="add-circle-outline"
          size={26}
          color={disabled ? '#3f3f46' : '#8b5cf6'}
        />
      </Pressable>

      <View className="flex-1">
        <TextInput
          value={text}
          onChangeText={setText}
          editable={!disabled}
          placeholder="Mensagem…"
          placeholderTextColor="#71717a"
          multiline
          maxLength={2000}
          className="bg-zinc-900 rounded-2xl px-4 py-2.5 text-base text-white max-h-32"
          style={{ minHeight: 40 }}
        />
        {nearLimit && (
          <Text className="text-[11px] text-zinc-500 self-end mt-0.5 mr-1">
            {text.length}/2000
          </Text>
        )}
      </View>

      <Pressable
        onPress={handleSend}
        disabled={!canSend}
        className={`w-10 h-10 items-center justify-center rounded-full ${canSend ? 'bg-violet-600' : 'bg-zinc-800'}`}
        accessibilityLabel="Enviar mensagem"
      >
        <Ionicons name="send" size={18} color={canSend ? '#ffffff' : '#52525b'} />
      </Pressable>
    </View>
  )
}

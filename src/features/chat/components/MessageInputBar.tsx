import { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type Props = {
  onSendText: (text: string) => void
  onAttach: () => void
  disabled?: boolean
  // Quando presente, a barra entra em modo edição: pré-preenche e o envio salva.
  editing?: { id: string; content: string } | null
  onSubmitEdit?: (text: string) => void
  onCancelEdit?: () => void
}

export function MessageInputBar({
  onSendText,
  onAttach,
  disabled,
  editing,
  onSubmitEdit,
  onCancelEdit,
}: Props) {
  const [text, setText] = useState('')
  const trimmed = text.trim()
  const isEditing = !!editing
  // O cooldown é do rate-limit de ENVIAR mensagem nova; editar é outra ação
  // (PATCH) e não deve ser bloqueada por ele.
  const canSend = trimmed.length > 0 && (isEditing || !disabled)
  const nearLimit = text.length > 1800

  // Deps primitivas: o pai recria o objeto `editing` a cada render, então
  // keyamos por id/conteúdo (por valor) pra prefixar só ao entrar em edição —
  // senão cada tecla dispararia o efeito e sobrescreveria o que foi digitado.
  const editingId = editing?.id
  const editingContent = editing?.content ?? ''

  useEffect(() => {
    if (editingId) setText(editingContent)
  }, [editingId, editingContent])

  function handleSend() {
    if (!canSend) return
    if (isEditing) onSubmitEdit?.(trimmed)
    else onSendText(trimmed)
    setText('')
  }

  function cancelEdit() {
    onCancelEdit?.()
    setText('')
  }

  return (
    <View className="border-t border-zinc-900 bg-black">
      {isEditing && (
        <View className="flex-row items-center justify-between px-4 py-1.5 bg-zinc-950">
          <View className="flex-row items-center gap-2">
            <Ionicons name="pencil" size={14} color="#8b5cf6" />
            <Text className="text-zinc-300 text-sm">Editando mensagem</Text>
          </View>
          <Pressable onPress={cancelEdit} accessibilityLabel="Cancelar edição">
            <Ionicons name="close" size={18} color="#a1a1aa" />
          </Pressable>
        </View>
      )}

      <View className="flex-row items-end gap-2 px-3 py-2">
        {!isEditing && (
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
        )}

        <View className="flex-1">
          <TextInput
            value={text}
            onChangeText={setText}
            editable={isEditing || !disabled}
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
          accessibilityLabel={isEditing ? 'Salvar edição' : 'Enviar mensagem'}
        >
          <Ionicons
            name={isEditing ? 'checkmark' : 'send'}
            size={18}
            color={canSend ? '#ffffff' : '#52525b'}
          />
        </Pressable>
      </View>
    </View>
  )
}

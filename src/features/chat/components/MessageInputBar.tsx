import { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/shared/theme'

type Props = {
  onSendText: (text: string) => void
  onAttach: () => void
  // Quando presente, o botão de envio vira microfone enquanto o campo está vazio.
  onStartRecording?: () => void
  disabled?: boolean
  // Quando presente, a barra entra em modo edição: pré-preenche e o envio salva.
  editing?: { id: string; content: string } | null
  onSubmitEdit?: (text: string) => void
  onCancelEdit?: () => void
  // Quando presente, mostra a barra "Respondendo a…" acima do input.
  replyingTo?: { senderName: string; preview: string } | null
  onCancelReply?: () => void
  // Sinais de "digitando" (só ao compor mensagem nova, não ao editar). O debounce
  // mora no hook chamador (useTypingSender).
  onTyping?: () => void
  onStopTyping?: () => void
}

export function MessageInputBar({
  onSendText,
  onAttach,
  onStartRecording,
  disabled,
  editing,
  onSubmitEdit,
  onCancelEdit,
  replyingTo,
  onCancelReply,
  onTyping,
  onStopTyping,
}: Props) {
  const [text, setText] = useState('')
  const trimmed = text.trim()
  const isEditing = !!editing
  // O cooldown é do rate-limit de ENVIAR mensagem nova; editar é outra ação
  // (PATCH) e não deve ser bloqueada por ele.
  const canSend = trimmed.length > 0 && (isEditing || !disabled)
  const nearLimit = text.length > 1800
  // Campo vazio (e não editando) → botão de microfone pra gravar nota de voz.
  const showMic = !isEditing && trimmed.length === 0 && !!onStartRecording

  // Deps primitivas: o pai recria o objeto `editing` a cada render, então
  // keyamos por id/conteúdo (por valor) pra prefixar só ao entrar em edição —
  // senão cada tecla dispararia o efeito e sobrescreveria o que foi digitado.
  const editingId = editing?.id
  const editingContent = editing?.content ?? ''

  useEffect(() => {
    if (editingId) setText(editingContent)
  }, [editingId, editingContent])

  // Dispara "digitando" só ao compor mensagem nova; some quando o campo esvazia.
  function handleChangeText(value: string) {
    setText(value)
    if (isEditing) return
    if (value.trim().length > 0) onTyping?.()
    else onStopTyping?.()
  }

  function handleSend() {
    if (!canSend) return
    if (isEditing) {
      onSubmitEdit?.(trimmed)
    } else {
      onSendText(trimmed)
      onStopTyping?.()
    }
    setText('')
  }

  function cancelEdit() {
    onCancelEdit?.()
    setText('')
  }

  return (
    <View className="border-t pb-7 px-2 pt-2 border-line-subtle bg-background">
      {isEditing && (
        <View className="flex-row items-center justify-between px-4 py-1.5 bg-surface-sunken">
          <View className="flex-row items-center gap-2">
            <Ionicons name="pencil" size={14} color={colors.brandEmphasis} />
            <Text className="text-content-tertiary text-sm">
              Editando mensagem
            </Text>
          </View>
          <Pressable onPress={cancelEdit} accessibilityLabel="Cancelar edição">
            <Ionicons name="close" size={18} color={colors.contentMuted} />
          </Pressable>
        </View>
      )}

      {replyingTo && !isEditing && (
        <View className="flex-row items-center justify-between px-4 py-1.5 bg-surface-sunken">
          <View className="flex-row items-center gap-2 flex-1">
            <Ionicons
              name="arrow-undo-outline"
              size={14}
              color={colors.brandEmphasis}
            />
            <View className="flex-1">
              <Text
                className="text-brand-text-strong text-[12px] font-semibold"
                numberOfLines={1}
              >
                Respondendo a {replyingTo.senderName}
              </Text>
              <Text
                className="text-content-muted text-[12px]"
                numberOfLines={1}
              >
                {replyingTo.preview}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={onCancelReply}
            accessibilityLabel="Cancelar resposta"
          >
            <Ionicons name="close" size={18} color={colors.contentMuted} />
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
              color={disabled ? colors.lineStrong : colors.brandEmphasis}
            />
          </Pressable>
        )}

        <View className="flex-1">
          <TextInput
            value={text}
            onChangeText={handleChangeText}
            editable={isEditing || !disabled}
            placeholder="Mensagem…"
            placeholderTextColor={colors.contentSubtle}
            multiline
            maxLength={2000}
            className="bg-surface rounded-2xl px-4 py-2.5 text-base text-content max-h-32"
            style={{ minHeight: 40 }}
          />
          {nearLimit && (
            <Text className="text-[11px] text-content-subtle self-end mt-0.5 mr-1">
              {text.length}/2000
            </Text>
          )}
        </View>

        {showMic ? (
          <Pressable
            onPress={onStartRecording}
            disabled={disabled}
            className="w-10 h-10 items-center justify-center rounded-full bg-surface-elevated"
            accessibilityLabel="Gravar áudio"
          >
            <Ionicons
              name="mic"
              size={20}
              color={disabled ? colors.contentFaint : colors.brandEmphasis}
            />
          </Pressable>
        ) : (
          <Pressable
            onPress={handleSend}
            disabled={!canSend}
            className={`w-10 h-10 items-center justify-center rounded-full ${canSend ? 'bg-brand' : 'bg-surface-elevated'}`}
            accessibilityLabel={isEditing ? 'Salvar edição' : 'Enviar mensagem'}
          >
            <Ionicons
              name={isEditing ? 'checkmark' : 'send'}
              size={18}
              color={canSend ? colors.content : colors.contentFaint}
            />
          </Pressable>
        )}
      </View>
    </View>
  )
}

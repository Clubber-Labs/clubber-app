import { View, Text, Pressable } from 'react-native'
import { SheetModal } from './SheetModal'
import { SheetRow } from './SheetRow'
import { QUICK_REACTIONS } from '../utils/reactions'
import type { ChatMessage } from '../types'

type Props = {
  visible: boolean
  message: ChatMessage | null
  canEdit: boolean
  canDelete: boolean
  canReport: boolean
  // Pode reagir (não é SYSTEM nem apagada).
  canReact: boolean
  // Emoji com que já reagi (destacado no picker); null se nenhum.
  myEmoji: string | null
  onClose: () => void
  onReact: (emoji: string) => void
  onCopy: () => void
  onEdit: () => void
  onReport: () => void
  onDelete: () => void
}

export function MessageActionsSheet({
  visible,
  message,
  canEdit,
  canDelete,
  canReport,
  canReact,
  myEmoji,
  onClose,
  onReact,
  onCopy,
  onEdit,
  onReport,
  onDelete,
}: Props) {
  const hasText = !!message?.content
  return (
    <SheetModal visible={visible} onClose={onClose}>
      {canReact && (
        <View className="flex-row justify-around px-3 pb-2 pt-1 border-b border-line mb-1">
          {QUICK_REACTIONS.map(emoji => (
            <Pressable
              key={emoji}
              onPress={() => {
                onClose()
                onReact(emoji)
              }}
              className={`w-11 h-11 items-center justify-center rounded-full ${
                emoji === myEmoji ? 'bg-brand/30' : ''
              }`}
              accessibilityLabel={`Reagir com ${emoji}`}
            >
              <Text className="text-2xl">{emoji}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {hasText && (
        <SheetRow
          icon="copy-outline"
          label="Copiar"
          onPress={() => {
            onClose()
            onCopy()
          }}
        />
      )}
      {canEdit && (
        <SheetRow
          icon="create-outline"
          label="Editar"
          onPress={() => {
            onClose()
            onEdit()
          }}
        />
      )}
      {canReport && (
        <SheetRow
          icon="flag-outline"
          label="Denunciar"
          onPress={() => {
            onClose()
            onReport()
          }}
        />
      )}
      {canDelete && (
        <SheetRow
          icon="trash-outline"
          label="Apagar"
          destructive
          onPress={() => {
            onClose()
            onDelete()
          }}
        />
      )}
    </SheetModal>
  )
}

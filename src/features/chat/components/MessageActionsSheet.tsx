import { SheetModal } from './SheetModal'
import { SheetRow } from './SheetRow'
import type { ChatMessage } from '../types'

type Props = {
  visible: boolean
  message: ChatMessage | null
  canEdit: boolean
  canDelete: boolean
  canReport: boolean
  onClose: () => void
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
  onClose,
  onCopy,
  onEdit,
  onReport,
  onDelete,
}: Props) {
  const hasText = !!message?.content
  return (
    <SheetModal visible={visible} onClose={onClose}>
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

import { SheetModal } from './SheetModal'
import { SheetRow } from './SheetRow'
import type { ChatMessage } from '../types'

type Props = {
  visible: boolean
  message: ChatMessage | null
  canDelete: boolean
  canReport: boolean
  onClose: () => void
  onCopy: () => void
  onReport: () => void
  onDelete: () => void
}

export function MessageActionsSheet({
  visible,
  message,
  canDelete,
  canReport,
  onClose,
  onCopy,
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

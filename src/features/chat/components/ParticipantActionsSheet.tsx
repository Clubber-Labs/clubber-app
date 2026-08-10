import {
  MinusCircleIcon,
  ShieldCheckIcon,
  UserMinusIcon,
} from 'phosphor-react-native'
import { SheetModal } from './SheetModal'
import { SheetRow } from './SheetRow'
import type { Participant } from '../types'

type Props = {
  visible: boolean
  participant: Participant | null
  onClose: () => void
  onToggleAdmin: () => void
  onRemove: () => void
}

export function ParticipantActionsSheet({
  visible,
  participant,
  onClose,
  onToggleAdmin,
  onRemove,
}: Props) {
  const isAdmin = participant?.role === 'ADMIN'
  return (
    <SheetModal visible={visible} onClose={onClose}>
      <SheetRow
        icon={isAdmin ? MinusCircleIcon : ShieldCheckIcon}
        label={isAdmin ? 'Remover admin' : 'Tornar admin'}
        onPress={() => {
          onClose()
          onToggleAdmin()
        }}
      />
      <SheetRow
        icon={UserMinusIcon}
        label="Remover do grupo"
        destructive
        onPress={() => {
          onClose()
          onRemove()
        }}
      />
    </SheetModal>
  )
}

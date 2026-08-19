import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const isAdmin = participant?.role === 'ADMIN'
  return (
    <SheetModal visible={visible} onClose={onClose}>
      <SheetRow
        icon={isAdmin ? MinusCircleIcon : ShieldCheckIcon}
        label={
          isAdmin ? t('chat.group.removeAdmin') : t('chat.group.makeAdmin')
        }
        onPress={() => {
          onClose()
          onToggleAdmin()
        }}
      />
      <SheetRow
        icon={UserMinusIcon}
        label={t('chat.group.removeTitle')}
        destructive
        onPress={() => {
          onClose()
          onRemove()
        }}
      />
    </SheetModal>
  )
}

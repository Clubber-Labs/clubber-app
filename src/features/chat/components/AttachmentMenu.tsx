import { ImageIcon, CameraIcon } from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import { SheetModal } from './SheetModal'
import { SheetRow } from './SheetRow'

type Props = {
  visible: boolean
  onClose: () => void
  onGallery: () => void
  onCamera: () => void
}

export function AttachmentMenu({
  visible,
  onClose,
  onGallery,
  onCamera,
}: Props) {
  const { t } = useTranslation()
  return (
    <SheetModal visible={visible} onClose={onClose}>
      <SheetRow
        icon={ImageIcon}
        label={t('chat.media.gallery')}
        onPress={() => {
          onClose()
          onGallery()
        }}
      />
      <SheetRow
        icon={CameraIcon}
        label={t('chat.media.camera')}
        onPress={() => {
          onClose()
          onCamera()
        }}
      />
    </SheetModal>
  )
}

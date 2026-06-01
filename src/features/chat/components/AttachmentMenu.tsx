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
  return (
    <SheetModal visible={visible} onClose={onClose}>
      <SheetRow
        icon="image-outline"
        label="Galeria"
        onPress={() => {
          onClose()
          onGallery()
        }}
      />
      <SheetRow
        icon="camera-outline"
        label="Câmera"
        onPress={() => {
          onClose()
          onCamera()
        }}
      />
    </SheetModal>
  )
}

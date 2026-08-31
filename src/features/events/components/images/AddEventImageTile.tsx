import { ActivityIndicator, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { PlusIcon } from 'phosphor-react-native'
import { colors } from '@/shared/theme'

type Props = {
  x: number
  y: number
  size: number
  uploading: boolean
  disabled: boolean
  onPress: () => void
}

export function AddEventImageTile({
  x,
  y,
  size,
  uploading,
  disabled,
  onPress,
}: Props) {
  const { t } = useTranslation()

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || uploading}
      accessibilityLabel={
        uploading
          ? t('events.imagesEditor.uploading')
          : t('events.imagePicker.addPhotos')
      }
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
      }}
      className="rounded-xl bg-surface border border-dashed border-line-strong items-center justify-center"
    >
      {uploading ? (
        <ActivityIndicator color={colors.contentMuted} />
      ) : (
        <PlusIcon
          size={24}
          color={disabled ? colors.contentFaint : colors.contentMuted}
        />
      )}
    </Pressable>
  )
}

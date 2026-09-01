import { memo } from 'react'
import { Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { PlusIcon } from 'phosphor-react-native'
import { colors } from '@/shared/theme'

type Props = {
  size: number
  onPress?: () => void
}

// "+" discreto na vaga livre da fileira: convida a preencher o mural sem
// competir com as fotos — superfície neutra, ícone apagado, sem borda.
export const ProfileMuralAddTile = memo(function ProfileMuralAddTile({
  size,
  onPress,
}: Props) {
  const { t } = useTranslation()
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('profile.mural.addPhoto')}
      className="items-center justify-center bg-surface active:bg-surface-elevated"
      style={{ width: size, height: size }}
    >
      <PlusIcon size={22} color={colors.contentSubtle} />
    </Pressable>
  )
})

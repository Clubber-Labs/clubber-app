import { memo } from 'react'
import { Pressable, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { PlusIcon } from 'phosphor-react-native'
import { colors } from '@/shared/theme'

type Props = {
  size: number
  onPress?: () => void
}

// Vaga livre da fileira virando convite: tracejado (é um lugar a preencher,
// não uma foto), "+" e o rótulo. Reto como os tiles do mural.
export const ProfileMuralAddTile = memo(function ProfileMuralAddTile({
  size,
  onPress,
}: Props) {
  const { t } = useTranslation()
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('profile.photo.title')}
      className="items-center justify-center gap-2 border border-dashed border-line-strong bg-surface active:bg-surface-elevated"
      style={{ width: size, height: size }}
    >
      <PlusIcon size={26} color={colors.contentMuted} />
      <Text className="text-[13px] font-semibold text-content-muted">
        {t('profile.photo.title')}
      </Text>
    </Pressable>
  )
})

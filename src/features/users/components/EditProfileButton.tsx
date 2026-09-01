import { Pressable, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { PencilSimpleIcon } from 'phosphor-react-native'
import { colors } from '@/shared/theme'

type Props = {
  onPress: () => void
}

export function EditProfileButton({ onPress }: Props) {
  const { t } = useTranslation()
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="h-11 flex-row items-center justify-center gap-2 rounded-full border border-line-strong"
    >
      <PencilSimpleIcon size={16} color={colors.contentSecondary} />
      <Text className="text-[13px] font-bold text-content-secondary">
        {t('profile.editButton')}
      </Text>
    </Pressable>
  )
}

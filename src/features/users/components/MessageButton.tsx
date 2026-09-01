import { Pressable, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { PaperPlaneTiltIcon } from 'phosphor-react-native'
import { colors } from '@/shared/theme'

type Props = {
  onPress: () => void
  loading?: boolean
}

// Pílula branca cheia com o avião: mesma altura do FollowButton pra alinhar na
// linha de ações.
export function MessageButton({ onPress, loading }: Props) {
  const { t } = useTranslation()
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={t('profile.message')}
      accessibilityState={{ disabled: !!loading, busy: !!loading }}
      className="h-11 min-w-[56px] items-center justify-center rounded-full bg-content px-5"
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.background} />
      ) : (
        <PaperPlaneTiltIcon size={18} weight="fill" color={colors.background} />
      )}
    </Pressable>
  )
}

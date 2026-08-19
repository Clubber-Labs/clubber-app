import { View, Text, Animated } from 'react-native'
import { useTranslation } from 'react-i18next'

type Props = {
  current: number
  total: number
  progressWidth: Animated.AnimatedInterpolation<string>
}

export function RegisterProgressBar({ current, total, progressWidth }: Props) {
  const { t } = useTranslation()
  return (
    <View className="gap-2">
      <Text className="text-xs text-content-subtle text-right">
        {t('auth.progress.step', { current: current + 1, total })}
      </Text>
      <View className="h-1 bg-surface-elevated rounded-full overflow-hidden">
        <Animated.View
          className="h-full bg-brand rounded-full"
          style={{ width: progressWidth }}
        />
      </View>
    </View>
  )
}

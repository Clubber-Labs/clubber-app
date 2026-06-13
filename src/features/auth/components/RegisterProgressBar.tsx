import { View, Text, Animated } from 'react-native'

type Props = {
  current: number
  total: number
  progressWidth: Animated.AnimatedInterpolation<string>
}

export function RegisterProgressBar({ current, total, progressWidth }: Props) {
  return (
    <View className="gap-2">
      <Text className="text-xs text-content-subtle text-right">
        {current + 1} de {total}
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

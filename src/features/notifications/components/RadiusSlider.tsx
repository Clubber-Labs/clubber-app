import { useState } from 'react'
import { View, Text } from 'react-native'
import Slider from '@react-native-community/slider'
import {
  NOTIFY_RADIUS_MIN_KM,
  NOTIFY_RADIUS_MAX_KM,
} from '../store/notificationPrefsStore'
import { colors } from '@/shared/theme'

type Props = {
  value: number
  onCommit: (km: number) => void
  disabled?: boolean
}

// Valor local enquanto arrasta (label acompanha sem PATCH por tick); o commit
// acontece só no onSlidingComplete.
export function RadiusSlider({ value, onCommit, disabled }: Props) {
  const [dragging, setDragging] = useState<number | null>(null)
  const shown = dragging ?? value

  return (
    <View className={disabled ? 'opacity-40' : undefined}>
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-content">
          Raio de aviso
        </Text>
        <Text className="text-sm font-semibold text-brand-text">
          {shown} km
        </Text>
      </View>
      <Slider
        minimumValue={NOTIFY_RADIUS_MIN_KM}
        maximumValue={NOTIFY_RADIUS_MAX_KM}
        step={1}
        value={value}
        disabled={disabled}
        onValueChange={setDragging}
        onSlidingComplete={km => {
          setDragging(null)
          onCommit(km)
        }}
        minimumTrackTintColor={colors.brand}
        maximumTrackTintColor={colors.line}
        thumbTintColor={colors.brandEmphasis}
      />
      <View className="flex-row justify-between">
        <Text className="text-xs text-content-faint">
          {NOTIFY_RADIUS_MIN_KM} km
        </Text>
        <Text className="text-xs text-content-faint">
          {NOTIFY_RADIUS_MAX_KM} km
        </Text>
      </View>
    </View>
  )
}

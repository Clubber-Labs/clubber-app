import { View, Text } from 'react-native'
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg'
import { colors } from '@/shared/theme'

type Props = {
  size: number
  emoji: string
}

// Miolo circular de pin: campo violeta com gradiente sutil + emoji da
// categoria, renderizado pelo sistema — sem fonte de ícones nem asset.
export function EmojiPinFace({ size, emoji }: Props) {
  return (
    <View
      style={{ width: size, height: size }}
      className="items-center justify-center"
    >
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <RadialGradient id="pin-face" cx="50%" cy="40%" r="75%">
            <Stop offset="0" stopColor={colors.brandEmphasis} />
            <Stop offset="1" stopColor={colors.brand} />
          </RadialGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2}
          fill="url(#pin-face)"
        />
      </Svg>
      <Text
        style={{
          fontSize: Math.round(size * 0.44),
          lineHeight: Math.round(size * 0.6),
          includeFontPadding: false,
        }}
      >
        {emoji}
      </Text>
    </View>
  )
}

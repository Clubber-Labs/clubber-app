import { View, Text } from 'react-native'
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg'
import { colors } from '@/shared/theme'

type Props = {
  size: number
  emoji: string
  // Matiz do campo atrás do emoji (experimento "cor é informação"): quando
  // presente, tinge o campo pela categoria; ausente, grafite neutro.
  field?: string
}

// Miolo circular de pin: campo grafite neutro com gradiente sutil + emoji da
// categoria — a cor do pin vem do emoji, não de cor de marca (mapa sem brand).
export function EmojiPinFace({ size, emoji, field }: Props) {
  return (
    <View
      style={{ width: size, height: size }}
      className="items-center justify-center"
    >
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <RadialGradient id="pin-face" cx="50%" cy="40%" r="75%">
            <Stop offset="0" stopColor={field ?? colors.surfaceElevated} />
            <Stop offset="1" stopColor={field ?? colors.surface} />
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

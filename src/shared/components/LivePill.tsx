import { useId } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { SPECTRUM } from '@/shared/theme'

type Props = {
  label?: string
}

// Pílula do "AGORA" no espectro-assinatura — único uso de gradiente fora dos
// rims do mapa (nunca em botão/chrome). Fundo via SVG: sem dependência de
// gradiente nativo; absoluteFill dá bounds em pixel (dimensão em % não
// re-resolve na new arch quando o container ganha altura no 1º layout).
export function LivePill({ label = 'Rolando agora' }: Props) {
  const gradientId = `live-pill-${useId().replace(/:/g, '')}`
  return (
    <View className="relative overflow-hidden rounded-md self-start">
      <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={SPECTRUM[0]} />
            <Stop offset="0.5" stopColor={SPECTRUM[1]} />
            <Stop offset="1" stopColor={SPECTRUM[2]} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
      <View className="flex-row items-center gap-1.5 px-2.5 py-1">
        <View className="w-1.5 h-1.5 rounded-full bg-content" />
        <Text className="text-xs font-bold text-content">{label}</Text>
      </View>
    </View>
  )
}

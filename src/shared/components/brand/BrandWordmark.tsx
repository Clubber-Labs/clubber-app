import { View, Text } from 'react-native'
import { colors } from '@/shared/theme'
import { BrandSticker } from './BrandSticker'

// Wordmark "clu[b]ber" — Sora ExtraBold com o primeiro b como sticker.
// height = tamanho da fonte; o sticker escala junto (1.6x — espelhado em
// scripts/build-splash-logo.mjs, que rasteriza isto pra splash nativa).
// Requer Sora_800ExtraBold carregada no _layout raiz (useFonts + gate do splash).
export function BrandWordmark({
  height = 16,
  inverted = false,
}: {
  height?: number
  inverted?: boolean
}) {
  const t = {
    fontFamily: 'Sora_800ExtraBold',
    fontSize: height,
    lineHeight: height,
    letterSpacing: -0.052 * height,
    color: inverted ? colors.background : colors.content,
  } as const
  return (
    <View className="flex-row items-end">
      <Text style={t}>clu</Text>
      <View
        style={{ marginBottom: -height * 0.1, marginLeft: 0, marginRight: -1 }}
      >
        <BrandSticker size={height * 1.6} inverted={inverted} />
      </View>
      <Text style={t}>ber</Text>
    </View>
  )
}

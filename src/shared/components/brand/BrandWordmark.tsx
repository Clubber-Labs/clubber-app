import { View, Text } from 'react-native'
import { colors } from '@/shared/theme'
import { BrandSticker } from './BrandSticker'

// Wordmark "clu[b]ber" — Sora Bold com o primeiro b como sticker.
// height = tamanho da fonte; o sticker escala junto (1.2x).
// Requer Sora_700Bold carregada no _layout raiz (useFonts + gate do splash).
export function BrandWordmark({ height = 16 }: { height?: number }) {
  const t = {
    fontFamily: 'Sora_700Bold',
    fontSize: height,
    lineHeight: height,
    letterSpacing: -0.025 * height,
    color: colors.content,
  } as const
  return (
    <View className="flex-row items-end">
      <Text style={t}>clu</Text>
      <View
        style={{ marginBottom: -height * 0.1, marginLeft: 0, marginRight: 0 }}
      >
        <BrandSticker size={height * 1.6} />
      </View>
      <Text style={t}>ber</Text>
    </View>
  )
}
